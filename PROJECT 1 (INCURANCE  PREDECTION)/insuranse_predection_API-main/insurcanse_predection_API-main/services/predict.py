from schemas import ModelInputs
import joblib
from services.cost_trasformer import dollarToSy ,dollar_to_sy_advanced

xg_model = joblib.load('models/xgb_model.pkl')
GB_model = joblib.load('models/GB_model.pkl')
Rf_model = joblib.load('models/RF_model.pkl')


def BMI_cat(bmi) -> int:
    if bmi < 18.5:
        return 0 
    elif bmi <25:
        return 1
    elif bmi <30:
        return 2
    else:
        return 3

def age_groups(age) -> int:
    if age <= 25:
        return 0
    elif age <= 40:
        return 1
    elif age <= 60:
        return 2
    else:
        return 3

def preproccesing(data:ModelInputs):
    health_risk: float = (data.smoker + data.diabetic + data.bmi + data.bloodpressure)
    smoker_bmi: float = data.smoker * data.bmi
    age_bmi: float = data.age * data.bmi
    bloodpressure_bmi: float = data.bloodpressure * data.bmi
    bloodpressure_diabetic: int = data.bloodpressure * data.diabetic

    input_data = [[data.age, data.gender, data.bmi , data.bloodpressure, 
    
                    data.diabetic, data.children, data.smoker, data.region, 

                    BMI_cat(data.bmi), health_risk, smoker_bmi, age_bmi, 
                    
                    age_groups(data.age), bloodpressure_bmi, bloodpressure_diabetic]]
    return input_data

def get_prediction(data:ModelInputs):
    return dollar_to_sy_advanced(int(xg_model.predict(preproccesing(data)).tolist()[0])
)
def compare_models(data : ModelInputs):

    input_data = preproccesing(data)


    xg_model_prediction = xg_model.predict(input_data)
    gb_model_prediction = GB_model.predict(input_data)
    rf_model_prediction = Rf_model.predict(input_data)

    return {
        'results':[
            {
            'name': 'XGBoost',
            'result': dollar_to_sy_advanced(int(xg_model_prediction.tolist()[0])),
            'description': 'XGBoost model prediction',
            'score':85
        },
        {
            'name': 'Gradient Boosting',
            'result': dollar_to_sy_advanced(int(gb_model_prediction.tolist()[0])),
            'description': 'Gradient boosting model prediction',
            'score':83
        },
        {
            'name': 'Random Forest',
            'result': dollar_to_sy_advanced(int(rf_model_prediction.tolist()[0])),
            'description': 'Random forest model prediction',
            'score':80
        }
        ]
    }