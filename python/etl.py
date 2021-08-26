# python3
from metadata import meta
from pathlib import Path
import pandas as pd
import numpy as np
import requests
import json


def request_api(uri: str) -> str:
    """
    Handle GET requests
    :param uri:             Api uri
    :return res.text:       If successful, response
    """
    try:
        res = requests.get(uri)
    except requests.exceptions as err:
        msg = f"ERROR: Could not GET uri: {uri}."
        print(msg, err)
        return

    if res.status_code == 200:
        return res.text
    else:
        msg = f"ERROR {res.status_code}: Could not GET uri: {uri}."
        print(msg)
        return


def load_json(text: str):
    """
    Make Get request and if successful load data in json object
    :param text:             String object to convert to JSON
    """
    try:
        obs = json.loads(text)
    except Exception as e:
        msg = f"ERROR: Could not parse data as JSON."
        print(msg, e)
        return
    return obs


def get_indicator_data(data, indicator, query_ind):
    output = []
    for country, row in data["indicators"][query_ind]["values"].items():
        row["country"] = country
        row["indicator"] = indicator
        output.append(row)
    return output


def get_gdp_dataframe():
    gdp_url = "https://api.worldbank.org/v2/country/all/indicator/"
    gdp_url += "NY.GDP.MKTP.CD?per_page=30000&format=json"
    gdp_res = request_api(gdp_url)
    if not gdp_res:
        return
    _gdp_data = load_json(gdp_res)
    if not _gdp_data:
        return
    gdp_data = _gdp_data[1]

    data = []
    for row in gdp_data:
        dict_row = {}
        dict_row["iso3"] = row["countryiso3code"]
        dict_row["year"] = row["date"]
        dict_row["nominal_gdp_usd"] = row["value"]
        data.append(dict_row)
    return pd.DataFrame(data)


def main():
    file_path = Path(__file__).parent.resolve()

    indicators = list(meta.keys())

    output = []
    # extract all indicators
    for indicator in indicators:
        # extract indicator data
        query_ind = meta[indicator]["indicator"]
        url = (
            f"https://www.imf.org/external/datamapper/api/index.php?values={query_ind}"
        )
        res_text = request_api(url)
        if not res_text:
            continue
        data = load_json(res_text)
        if not data:
            continue
        ind_data = get_indicator_data(data, indicator, query_ind)
        output.extend(ind_data)

    # extract metadata
    meta_url = "https://api.worldbank.org/v2/country/all?format=json&per_page=300"
    meta_text = request_api(meta_url)
    if not meta_text:
        return
    metadata = load_json(meta_text)
    if not metadata:
        return
    meta_dict = get_metadata(metadata)

    # clean data
    _df = pd.DataFrame(output)
    df = _df.melt(id_vars=["country", "indicator"])
    df = df.pivot_table(
        index=["country", "variable"], columns="indicator", values="value"
    ).reset_index()

    df["countryName"] = df["country"].apply(
        lambda x: meta_dict[x]["name"] if x in meta_dict.keys() else np.nan
    )
    df["incomeLevel"] = df["country"].apply(
        lambda x: meta_dict[x]["incomeLevel"] if x in meta_dict.keys() else np.nan
    )
    df["region"] = df["country"].apply(
        lambda x: meta_dict[x]["region"] if x in meta_dict.keys() else np.nan
    )
    df.rename(columns={"variable": "year"}, inplace=True)

    # extract nominal gdp
    gdp_df = get_gdp_dataframe()

    merged_df = pd.merge(
        df, gdp_df, how="left", left_on=["country", "year"], right_on=["iso3", "year"]
    )

    del merged_df["iso3"]

    # dump df data to csv
    merged_df.to_csv(file_path / "data/data.csv", index=False)

    # group merged data by year
    final_output = {}
    grouped_df = merged_df.groupby("year")
    for name, group in grouped_df:
        final_output[name] = [dict(v) for _, v in group.iterrows()]

    # dump json to S3 bucket
    with open(file_path / "data/data.json", "w", encoding="utf-8") as file:
        json.fump(final_output, file, ensure_ascii=False, indent=4)

    return "Successful!"


def get_metadata(metadata):
    meta_dict = {}
    for country in metadata[1]:
        meta_dict[country["id"]] = {
            "name": country["name"],
            "incomeLevel": country["incomeLevel"]["value"],
            "region": country["region"]["value"],
        }

    return meta_dict


if __name__ == "__main__":
    main()
