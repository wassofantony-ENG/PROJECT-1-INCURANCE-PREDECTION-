import numpy as np


def dollarToSy(cost):
    avg_us_salary = 64500
    avg_sy_salary = 120000
    return round((cost/avg_us_salary)*avg_sy_salary , -2)


def dollar_to_sy_advanced(cost):
    economic_factors = {
        "avg_salary_ratio": 120000 / 64500,
        "gdp_ppp_ratio": 4200 / 75500,
        "cost_of_living_ratio": 25.0 / 68.8,
        "healthcare_cost_index_ratio": 58.2 / 122.8,
    }

    weights = np.array([0.35, 0.25, 0.25, 0.15])
    factors = np.array(list(economic_factors.values()))

    weighted_geometric_mean = np.exp(np.sum(weights * np.log(factors)))
    log_estimate = np.log(cost) + np.log(weighted_geometric_mean)

    return round(np.exp(log_estimate), -2)