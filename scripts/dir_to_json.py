import os
import json

def dir_to_dict(path, parent_name=None):
    dir_dict = {'type': parent_name if parent_name else 'directory', 'name': os.path.basename(path), 'children': []}
    
    # Sort items alphabetically
    items = sorted(os.listdir(path))
    
    for item in items:
        item_path = os.path.join(path, item)
        if os.path.isdir(item_path) and item != '.git':
            if parent_name is None:  # This is a course
                dir_dict['children'].append(dir_to_dict(item_path, 'course'))
            elif parent_name == 'course':  # This is a course folder
                dir_dict['children'].append(dir_to_dict(item_path, 'coursefolder'))
            elif parent_name == 'coursefolder':  # This is an image folder
                dir_dict['children'].append(dir_to_dict(item_path, 'images'))
            else:
                dir_dict['children'].append(dir_to_dict(item_path, parent_name))
        elif not os.path.isdir(item_path) and item != '.DS_Store':
            dir_dict['children'].append({'type': 'file', 'name': item})
    
    # Sort children alphabetically by name
    dir_dict['children'] = sorted(dir_dict['children'], key=lambda x: x['name'])
    
    return dir_dict

directory_tree_dict = dir_to_dict('/Users/jeremiah/Documents/A11yGator')

output_path = '/Users/jeremiah/Documents/A11yGator/data.json'
with open(output_path, 'w') as f:
    json.dump(directory_tree_dict, f, indent=4)

print(f"Directory tree saved to {output_path}")
