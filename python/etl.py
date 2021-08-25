# python3
from metadata import meta
from pathlib import Path
from io import StringIO
import configparser
import pandas as pd
import numpy as np
import requests
import boto3
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


def main():
    config = configparser.ConfigParser()
    config_path = Path(__file__).parent.resolve().parents[0]
    config_name = "credentials.cfg"
    config.read(f"{config_path}/{config_name}")

    AWS_ACCESS_KEY_ID = config.get("AWS", "AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = config.get("AWS", "AWS_SECRET_ACCESS_KEY")
    AWS_REGION = config.get("AWS", "AWS_REGION")
    S3_BUCKET = config.get("AWS", "AWS_BUCKET")

    s3 = boto3.resource(
        "s3",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )

    try:
        s3.create_bucket(
            Bucket=S3_BUCKET,
            CreateBucketConfiguration={
                "LocationConstraint": AWS_REGION,
            },
        )
    except Exception as e:
        if e.response["Error"]["Code"] == "InvalidBucketName":
            msg = f"""ERROR: `{S3_BUCKET}` bucket name is not valid.
        Try a new bucket name."""
        else:
            msg = f"ERROR: Could not create S3 bucket `{S3_BUCKET}`."
        print(msg, e)
        return

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

    # dump df data to S3 bucket
    csv_buffer = StringIO()
    df.to_csv(csv_buffer, index=False)

    try:
        s3.Object(S3_BUCKET, "data.csv").put(Body=csv_buffer.getvalue())
    except Exception as e:
        msg = f"ERROR: Could not dump data in S3 bucket."
        print(msg, e)
        return
    return


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
