import openpyxl
import json
import sys
from datetime import datetime, date


def convert_value(value):
    if isinstance(value, (datetime, date)):
        return value.strftime("%Y-%m-%d")
    return value


def xlsx_to_json(
    input_file,
    output_file,
    ignore_columns=None,
    column_mapping=None
):
    if ignore_columns is None:
        ignore_columns = []

    if column_mapping is None:
        column_mapping = {}

    workbook = openpyxl.load_workbook(input_file, data_only=True)
    sheet = workbook.active

    # First row = column names
    headers = [cell.value for cell in sheet[1]]

    result = []

    # Process each data row
    for row in sheet.iter_rows(min_row=2, values_only=True):

        # Skip completely empty rows
        if all(value is None for value in row):
            continue

        obj = {}

        for header, value in zip(headers, row):

            if header is None:
                continue

            header = str(header)

            # Ignore specified columns
            if header in ignore_columns:
                continue

            # Map Excel column name -> JSON property name
            json_name = column_mapping.get(header, header)

            obj[json_name] = convert_value(value)

        result.append(obj)

    # Write JSON
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(
            result,
            f,
            ensure_ascii=False,
            indent=2
        )

    print(f"Generated {len(result)} JSON objects")
    print(f"Output: {output_file}")


output_file = "businesses_parsed.json"
input_file = "Contact Information (Responses).xlsx"
ignore_columns = ["Timestamp"]
column_mapping = {
    "商户名称": "business_name",
    "联系人(群微信名)": "wechat",
    "一级分类": "catName",
    "二级分类": "subCatName",
    "联系电话": "phone",
    "Email": "Email",
    "网站": "url",
    "简介": "desc",
    "地址": "address"
    }
xlsx_to_json(input_file, output_file, ignore_columns, column_mapping)