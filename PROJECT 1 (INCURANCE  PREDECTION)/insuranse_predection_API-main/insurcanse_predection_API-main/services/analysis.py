from schemas import Analysis_requset, Analysis_response

def user_analysis(data: Analysis_requset) -> Analysis_response:
    items = data.data or []
    clients_num = len(items)
    if clients_num == 0:
        return Analysis_response(avg_cost=0.0, avg_age=0, avg_AI_pred=0.0, clients_num=0, final_value_set=0)

    sum_age = 0
    sum_ai = 0.0
    sum_cost = 0.0
    cost_count = 0
    final_value_set = 0

    for p in items:
        sum_age += p.age
        if p.AI_Prediction is not None:
            sum_ai += p.AI_Prediction
        if p.final_cost is not None:
            sum_cost += p.final_cost
            cost_count += 1
            final_value_set += 1

    avg_age = int(sum_age / clients_num)
    avg_AI_pred = float(sum_ai / clients_num) if clients_num else 0.0
    if cost_count:
        avg_cost = float(sum_cost / cost_count)
    else:
        avg_cost = float(sum_ai / clients_num) if clients_num else 0.0

    return Analysis_response(
        avg_cost=avg_cost,
        avg_age=avg_age,
        avg_AI_pred=avg_AI_pred,
        clients_num=clients_num,
        final_value_set=final_value_set,
    )