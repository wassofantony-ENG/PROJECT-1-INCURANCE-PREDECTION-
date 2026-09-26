from fastapi import APIRouter ,status , HTTPException , Depends
from schemas import UserData , ModInfo , LoginForm , UserResponse , Analysis_requset , Analysis_response , ChartsResponse
from services.db_anotation import db_dependency
from services.auth import create_access_token
from services.auth import get_current_user
from services.hash import hash_password, verify_password
from services.analysis import user_analysis
from db import client
from fastapi.security import OAuth2PasswordBearer ,OAuth2PasswordRequestForm
from datetime import timedelta
from sqlalchemy import or_
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='users/loginSwagger')

router = APIRouter(
    prefix='/users',
    tags=['users']
)

@router.post('/login')
async def login(loginForm: LoginForm, db: db_dependency):
    user = db.query(client.Users).filter(client.Users.email == loginForm.email).first()
    if not user or not client.Users.password == loginForm.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    access_token = create_access_token(data={"sub": user.username}, expires_delta=timedelta(minutes=30))
    return {"access_token": access_token, "token_type": "bearer"}


@router.post('/register')
async def register(userData : UserData , db:db_dependency):
    check_user = db.query(client.Users).filter(or_(client.Users.username == userData.username, client.Users.email == userData.email)).first()
    if check_user:
        raise HTTPException(
            status_code= status.HTTP_409_CONFLICT
            ,detail='username or email already in use'
        )
    
    hashed_password = userData.password
    user = client.Users(username = userData.username , email = userData.email , password = hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=timedelta(minutes=30))

    return {'access_token':access_token , 'token_type':'bearer'}
    


@router.get('/check' , response_model=UserResponse , status_code=status.HTTP_202_ACCEPTED)
async def getUser(db:db_dependency , current_user:client.Users = Depends(get_current_user)):
    user = db.query(client.Users).filter(client.Users.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='user do not exist'
        )
    return user


@router.put('/' , status_code= status.HTTP_200_OK)
async def alterInfo(data:ModInfo,db:db_dependency , current_user : client.Users = Depends(get_current_user)):
    id = current_user.id
    user = db.query(client.Users).filter(client.Users.id == id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='user do not exist'
        )
    if data.username:
        usernameInUse = db.query(client.Users).filter(client.Users.username == data.username, client.Users.id != id).first()
        if usernameInUse:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail='username already in use'
            )
        user.username = data.username  # type: ignore
    if data.password:
        user.password = hash_password(data.password)  # type: ignore
    db.add(user)
    db.commit()
    db.refresh(user)
    return {'message': 'user data was modified'}

@router.delete('/' , status_code=status.HTTP_202_ACCEPTED)
async def deleteUser(db:db_dependency , current_user : client.Users = Depends(get_current_user)):
    id = current_user.id
    user = db.query(client.Users).filter(client.Users.id == id).first()
    if user is None :
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='there is no user with the given id'
        )
    db.query(client.Predictions).filter(client.Predictions.user_id == id).delete()
    db.delete(user)
    db.commit()
    return {'message': 'user was deleted'}



    """
    dev route
    the fowllowing route is just for development 
    its made to work with Oauth standerds
    
    """

@router.post("/loginSwagger")
async def loginDocs(db:db_dependency,form_data: OAuth2PasswordRequestForm = Depends()):
    # form_data.username contains the email the user typed in Swagger's "username" field
    email = form_data.username
    password = form_data.password

    # your existing authentication with email and password
    
    user = db.query(client.Users).filter(client.Users.email == email).first()
    if not user or not verify_password(password, str(user.password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    access_token = create_access_token(data={"sub": user.username}, expires_delta=timedelta(minutes=30))
    return {"access_token": access_token, "token_type": "bearer"}

from services.analysis import user_analysis

@router.get('/analysis')
async def get_user_analysis(db:db_dependency , current_user:client.Users = Depends(get_current_user)):
    all_clients = db.query(client.Predictions).filter(client.Predictions.user_id == current_user.id).all()   
    clients_num = db.query(client.Predictions).filter(client.Predictions.user_id == current_user.id).count()   
    
    if clients_num == 0:
        return Analysis_response(avg_cost=0.0, avg_age=0, avg_AI_pred=0.0, clients_num=0, final_value_set=0)

    sum_age = 0
    sum_ai = 0.0
    sum_cost = 0.0
    cost_count = 0
    final_value_set = 0

    for p in all_clients:
        sum_age += p.age
        if p.AI_Prediction is not None:
            sum_ai += p.AI_Prediction
        if p.final_cost is not None:
            sum_cost += p.final_cost
            cost_count += 1
        if p.isDone == True:
            final_value_set += 1

    avg_age = int(sum_age / clients_num)  #type:ignore
    avg_AI_pred = float(sum_ai / clients_num) if clients_num else 0.0 #type:ignore
    if cost_count:
        avg_cost = float(sum_cost / cost_count) #type:ignore
    else:
        avg_cost = float(sum_ai / clients_num) if clients_num else 0.0 #type:ignore

    return Analysis_response(
        avg_cost=avg_cost,
        avg_age=avg_age,
        avg_AI_pred=avg_AI_pred,
        clients_num=clients_num,
        final_value_set=final_value_set,
    )

def _get_age_group(age: int) -> str:
    if age <= 25:
        return "18-25"
    elif age <= 35:
        return "26-35"
    elif age <= 45:
        return "36-45"
    elif age <= 55:
        return "46-55"
    elif age <= 65:
        return "56-65"
    else:
        return "65+"

def _get_bmi_range(bmi: int) -> str:
    if bmi < 19:
        return "Underweight (<18.5)"
    elif bmi <= 25:
        return "Normal (18.5-25)"
    elif bmi <= 30:
        return "Overweight (25-30)"
    else:
        return "Obese (>30)"

def _get_bp_range(bp: int) -> str:
    if bp < 120:
        return "Normal (<120)"
    elif bp < 130:
        return "Elevated (120-129)"
    else:
        return "High (>=130)"

@router.get('/analysis/charts', response_model=ChartsResponse)
async def get_user_analysis_charts(db: db_dependency, current_user: client.Users = Depends(get_current_user)):
    all_clients = db.query(client.Predictions).filter(client.Predictions.user_id == current_user.id).all()

    age_groups = {}
    region_groups = {}
    smoker_data = {"Non-smoker": {"count": 0, "total_cost": 0.0, "cost_count": 0}, "Smoker": {"count": 0, "total_cost": 0.0, "cost_count": 0}}
    gender_data = {"Female": {"count": 0, "total_cost": 0.0, "cost_count": 0}, "Male": {"count": 0, "total_cost": 0.0, "cost_count": 0}}
    diabetic_data = {"Non-diabetic": {"count": 0, "total_cost": 0.0, "cost_count": 0}, "Diabetic": {"count": 0, "total_cost": 0.0, "cost_count": 0}}
    children_data = {}
    bmi_data = {}
    pred_vs_actual = []
    bp_data = {}

    for p in all_clients:
        cost = p.final_cost if p.final_cost is not None else p.AI_Prediction
        has_cost = cost is not None

        age_group = _get_age_group(p.age)
        if age_group not in age_groups:
            age_groups[age_group] = {"count": 0, "total_cost": 0.0, "cost_count": 0}
        age_groups[age_group]["count"] += 1
        if has_cost:
            age_groups[age_group]["total_cost"] += cost
            age_groups[age_group]["cost_count"] += 1

        if p.region not in region_groups:
            region_groups[p.region] = {"count": 0, "total_cost": 0.0, "cost_count": 0}
        region_groups[p.region]["count"] += 1
        if has_cost:
            region_groups[p.region]["total_cost"] += cost
            region_groups[p.region]["cost_count"] += 1

        label = "Smoker" if p.smoker == 1 else "Non-smoker"
        smoker_data[label]["count"] += 1
        if has_cost:
            smoker_data[label]["total_cost"] += cost
            smoker_data[label]["cost_count"] += 1

        g_label = "Male" if p.gender == 1 else "Female"
        gender_data[g_label]["count"] += 1
        if has_cost:
            gender_data[g_label]["total_cost"] += cost
            gender_data[g_label]["cost_count"] += 1

        d_label = "Diabetic" if p.diabetic == 1 else "Non-diabetic"
        diabetic_data[d_label]["count"] += 1
        if has_cost:
            diabetic_data[d_label]["total_cost"] += cost
            diabetic_data[d_label]["cost_count"] += 1

        child_key = str(p.children) if p.children < 3 else "3+"
        if child_key not in children_data:
            children_data[child_key] = {"count": 0, "total_cost": 0.0, "cost_count": 0}
        children_data[child_key]["count"] += 1
        if has_cost:
            children_data[child_key]["total_cost"] += cost
            children_data[child_key]["cost_count"] += 1

        bmi_range = _get_bmi_range(p.bmi)
        if bmi_range not in bmi_data:
            bmi_data[bmi_range] = {"count": 0, "total_cost": 0.0, "cost_count": 0}
        bmi_data[bmi_range]["count"] += 1
        if has_cost:
            bmi_data[bmi_range]["total_cost"] += cost
            bmi_data[bmi_range]["cost_count"] += 1

        if p.isDone and p.AI_Prediction is not None and p.final_cost is not None:
            pred_vs_actual.append({"predicted": float(p.AI_Prediction), "actual": float(p.final_cost)})

        bp_range = _get_bp_range(p.bloodpressure)
        if bp_range not in bp_data:
            bp_data[bp_range] = {"count": 0, "total_cost": 0.0, "cost_count": 0}
        bp_data[bp_range]["count"] += 1
        if has_cost:
            bp_data[bp_range]["total_cost"] += cost
            bp_data[bp_range]["cost_count"] += 1

    def _avg_cost(data: dict) -> float:
        if data["cost_count"] > 0:
            return round(data["total_cost"] / data["cost_count"], 2)
        return 0.0

    def _sort_children(item):
        k = item[0]
        return int(k) if k.isdigit() else 99

    return ChartsResponse(
        costByAgeGroup=[{"group": g, "avg_cost": _avg_cost(d), "count": d["count"]} for g, d in sorted(age_groups.items())],
        costByRegion=[{"region": int(r), "avg_cost": _avg_cost(d), "count": d["count"]} for r, d in sorted(region_groups.items())],
        smokerBreakdown=[{"label": l, "count": d["count"], "avg_cost": _avg_cost(d)} for l, d in smoker_data.items()],
        genderBreakdown=[{"label": l, "count": d["count"], "avg_cost": _avg_cost(d)} for l, d in gender_data.items()],
        diabeticBreakdown=[{"label": l, "count": d["count"], "avg_cost": _avg_cost(d)} for l, d in diabetic_data.items()],
        childrenBreakdown=[{"children": int(c) if c.isdigit() else c, "count": d["count"], "avg_cost": _avg_cost(d)} for c, d in sorted(children_data.items(), key=_sort_children)],
        bmiDistribution=[{"range": r, "count": d["count"], "avg_cost": _avg_cost(d)} for r, d in bmi_data.items()],
        predictionVsActual=pred_vs_actual,
        bloodPressureRisk=[{"range": r, "count": d["count"], "avg_cost": _avg_cost(d)} for r, d in bp_data.items()],
    )
