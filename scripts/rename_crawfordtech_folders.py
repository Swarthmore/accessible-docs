import os

def append_to_folder_names(root_folder, text_to_append):
    for item in os.listdir(root_folder):
        item_path = os.path.join(root_folder, item)
        if os.path.isdir(item_path):
            new_item_path = os.path.join(root_folder, item + text_to_append)
            os.rename(item_path, new_item_path)
            print(f"Renamed folder '{item_path}' to '{new_item_path}'.")

if __name__ == "__main__":
    root_folder = '/Users/jeremiah/Documents/CrawfordTech'  
    append_to_folder_names(root_folder, "-CT")
