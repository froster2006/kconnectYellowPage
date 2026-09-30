import openpyxl
import json
import sys
from datetime import datetime, date

DEFAULT_CATEGORY_ICON = "📌"


def convert_value(value):
    """
    Convert Excel values into JSON-safe values.
    """
    if isinstance(value, (datetime, date)):
        return value.strftime("%Y-%m-%d")

    return value


def xlsx_to_json(
    input_file,
    output_business_file,
    output_category_file,
    ignore_columns=None,
    column_mapping=None
):
    """
    Convert an Excel file into:

    1. businesses.json
    2. categories.json

    Parameters:
        input_file:
            Excel input file (.xlsx)

        output_business_file:
            Output JSON file for businesses

        output_category_file:
            Output JSON file for categories

        ignore_columns:
            List of Excel column names to ignore

        column_mapping:
            Dictionary mapping Excel column names to JSON field names

    Example:

        ignore_columns = [
            "Internal Notes",
            "Created Date"
        ]

        column_mapping = {
            "商家名称": "business_name",
            "微信": "wechat",
            "分类": "catName",
            "子分类": "subCatName",
            "电话": "phone",
            "邮箱": "Email",
            "地址": "address",
            "网址": "url",
            "描述": "desc"
        }
    """

    # ---------------------------------------------------------
    # Default arguments
    # ---------------------------------------------------------

    if ignore_columns is None:
        ignore_columns = []

    if column_mapping is None:
        column_mapping = {}

    # Convert ignore columns to strings so comparisons are consistent
    ignore_columns = [str(column) for column in ignore_columns]

    # ---------------------------------------------------------
    # Load workbook
    # ---------------------------------------------------------

    workbook = openpyxl.load_workbook(
        input_file,
        data_only=True
    )

    sheet = workbook.active

    # ---------------------------------------------------------
    # Read headers
    # ---------------------------------------------------------

    headers = [cell.value for cell in sheet[1]]

    # ---------------------------------------------------------
    # Find catName / subCatName columns
    #
    # Important:
    # We apply column_mapping first.
    #
    # This means both of these will work:
    #
    #   catName
    #   subCatName
    #
    # or:
    #
    #   分类
    #   子分类
    #
    # if the mapping contains:
    #
    #   "分类": "catName"
    #   "子分类": "subCatName"
    # ---------------------------------------------------------

    cat_index = None
    subcat_index = None

    for index, header in enumerate(headers):

        if header is None:
            continue

        header = str(header)

        mapped_header = column_mapping.get(
            header,
            header
        )

        if mapped_header == "catName":
            cat_index = index

        elif mapped_header == "subCatName":
            subcat_index = index

    # ---------------------------------------------------------
    # Validate required category columns
    # ---------------------------------------------------------

    if cat_index is None:
        raise ValueError(
            "Column 'catName' was not found. "
            "If your Excel column has a different name, "
            "add it to column_mapping."
        )

    if subcat_index is None:
        raise ValueError(
            "Column 'subCatName' was not found. "
            "If your Excel column has a different name, "
            "add it to column_mapping."
        )

    # ---------------------------------------------------------
    # Containers
    # ---------------------------------------------------------

    businesses = []

    # Dictionary is used internally to prevent duplicate
    # categories and subcategories.
    #
    # Example:
    #
    # {
    #     "医疗保健": {
    #         "name": "医疗保健",
    #         "icon": "📌",
    #         "sub": [
    #             {"name": "针灸推拿"},
    #             {"name": "中医理疗"}
    #         ]
    #     }
    # }
    #
    categories = {}

    # ---------------------------------------------------------
    # Process each Excel row
    # ---------------------------------------------------------

    for row in sheet.iter_rows(
        min_row=2,
        values_only=True
    ):

        # Skip completely empty rows
        if all(value is None for value in row):
            continue

        # -----------------------------------------------------
        # Get category names
        # -----------------------------------------------------

        cat_name = row[cat_index]
        subcat_name = row[subcat_index]

        # Clean category name
        if cat_name is not None:
            cat_name = str(cat_name).strip()

        # Clean subcategory name
        if subcat_name is not None:
            subcat_name = str(subcat_name).strip()

        # -----------------------------------------------------
        # Build categories.json structure
        # -----------------------------------------------------

        if cat_name:

            # Create category if it doesn't exist
            if cat_name not in categories:

                categories[cat_name] = {
                    "name": cat_name,
                    "icon": DEFAULT_CATEGORY_ICON,
                    "sub": []
                }

            # Add subcategory if it exists
            if subcat_name:

                existing_subcategory = next(
                    (
                        sub
                        for sub in categories[cat_name]["sub"]
                        if sub["name"] == subcat_name
                    ),
                    None
                )

                # Prevent duplicate subcategories
                if existing_subcategory is None:

                    categories[cat_name]["sub"].append({
                        "name": subcat_name
                    })

        # -----------------------------------------------------
        # Build businesses.json object
        # -----------------------------------------------------

        business = {}

        for header, value in zip(headers, row):

            # Ignore columns without a header
            if header is None:
                continue

            header = str(header)

            # Skip ignored columns
            if header in ignore_columns:
                continue

            # Apply column mapping
            json_name = column_mapping.get(
                header,
                header
            )

            # Convert dates/datetimes to JSON-safe strings
            value = convert_value(value)

            business[json_name] = value

        businesses.append(business)

    # ---------------------------------------------------------
    # Write businesses.json
    # ---------------------------------------------------------

    with open(
        output_business_file,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            businesses,
            f,
            ensure_ascii=False,
            indent=2
        )

    # ---------------------------------------------------------
    # Write categories.json
    # ---------------------------------------------------------

    with open(
        output_category_file,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            list(categories.values()),
            f,
            ensure_ascii=False,
            indent=2
        )

    # ---------------------------------------------------------
    # Output summary
    # ---------------------------------------------------------

    print(
        f"Generated {len(businesses)} businesses"
    )

    print(
        f"Generated {len(categories)} categories"
    )

    print(
        f"Business output: {output_business_file}"
    )

    print(
        f"Category output: {output_category_file}"
    )


output_file_business = "businesses_parsed.json"
output_file_category = "category_parsed.json"
input_file = "Contact Information (Responses)(1).xlsx"
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
xlsx_to_json(input_file, output_file_business,output_file_category, ignore_columns, column_mapping)