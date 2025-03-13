import os
import json

def dir_to_dict(path):
    dir_dict = {'type': 'directory', 'name': os.path.basename(path), 'children': []}
    for item in os.listdir(path):
        item_path = os.path.join(path, item)
        if os.path.isdir(item_path) and item != '.git':
            dir_dict['children'].append(dir_to_dict(item_path))
        elif not os.path.isdir(item_path) and item != '.DS_Store':    
            dir_dict['children'].append({'type': 'file', 'name': item})
    return dir_dict
path = '/Users/jeremiah/Documents/CrawfordTech' # Replace with your actual root folder path
root_folder_name= os.path.basename(path)
directory_tree_dict = dir_to_dict(path)

# Conversion of JSON to HTML
def json_to_html(json_dict, depth=0):
    # Define the styles
    styles = {
        'directory': 'style="font-size: 17px; font-weight: bold; list-style-type: disc; line-height: 40px; font-family: Arial, sans-serif; background-color: blue;"',
        'file': 'style="font-size: 15px; font-weight: normal; list-style-type: circle; line-height: 37px; font-family: Arial, sans-serif; color: white; background-color: red; margin: 4px; padding-left: 10px; "',
    }

    html_content = '<ul>\n'
    for child in json_dict['children']:
        style = styles[child['type']] if depth > 0 else styles['directory']
        if child['type'] == 'file':
            html_content += f'<li {style}>{child["name"]}</li>\n'
        else:  # 'type' is 'directory'
            html_content += f'<li {style}>{child["name"]}{json_to_html(child, depth + 1)}</li>\n'
    html_content += '</ul>\n'

    return html_content

html_content = json_to_html(directory_tree_dict)

with open(f'{root_folder_name}.html', 'w') as html_file:
    html_file.write(html_content)

# **************

# import os
# import json

# def dir_to_dict(path):
#     dir_dict = {'type': 'directory', 'name': os.path.basename(path), 'children': []}
#     for item in os.listdir(path):
#         item_path = os.path.join(path, item)
#         if os.path.isdir(item_path) and item != '.git':
#             dir_dict['children'].append(dir_to_dict(item_path))
#         elif not os.path.isdir(item_path) and item != '.DS_Store':    # This line has been modified
#             dir_dict['children'].append({'type': 'file', 'name': item})
#     return dir_dict

# directory_tree_dict = dir_to_dict('/Users/jeremiah/Downloads/A11yGator')

# with open('directory_tree.json', 'w') as f:
#     json.dump(directory_tree_dict, f, indent=4)

# import os
# import json

# def dir_to_dict(path, parent_name=None):
#     dir_dict = {'type': parent_name if parent_name else 'directory', 'name': os.path.basename(path), 'children': []}
#     for item in os.listdir(path):
#         item_path = os.path.join(path, item)
#         if os.path.isdir(item_path) and item != '.git':
#             if parent_name is None:  # This is a course
#                 dir_dict['children'].append(dir_to_dict(item_path, 'course'))
#             elif parent_name == 'course':  # This is a course folder
#                 dir_dict['children'].append(dir_to_dict(item_path, 'coursefolder'))
#             else:
#                 dir_dict['children'].append(dir_to_dict(item_path, parent_name))
#         elif not os.path.isdir(item_path) and item != '.DS_Store':
#             dir_dict['children'].append({'type': 'file', 'name': item})
#     return dir_dict

# directory_tree_dict = dir_to_dict('/Users/jeremiah/Downloads/A11yGator')

# with open('directory_tree_test2.json', 'w') as f:
#     json.dump(directory_tree_dict, f, indent=4)




# import os
# import json

# def dir_to_dict(path, parent_name=None):
#     dir_dict = {'type': parent_name if parent_name else 'directory', 'name': os.path.basename(path), 'children': []}
#     for item in os.listdir(path):
#         item_path = os.path.join(path, item)
#         if os.path.isdir(item_path) and item != '.git':
#             if parent_name is None:  # This is a course
#                 dir_dict['children'].append(dir_to_dict(item_path, 'course'))
#             elif parent_name == 'course':  # This is a course folder
#                 dir_dict['children'].append(dir_to_dict(item_path, 'coursefolder'))
#             elif parent_name == 'coursefolder':  # This is an image folder
#                 dir_dict['children'].append(dir_to_dict(item_path, 'images'))
#             else:
#                 dir_dict['children'].append(dir_to_dict(item_path, parent_name))
#         elif not os.path.isdir(item_path) and item != '.DS_Store':
#             dir_dict['children'].append({'type': 'file', 'name': item})
#     return dir_dict

# directory_tree_dict = dir_to_dict('/Users/jeremiah/Downloads/A11yGator')

# with open('directory_tree.json', 'w') as f:
#     json.dump(directory_tree_dict, f, indent=4)


