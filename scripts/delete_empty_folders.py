import os

def delete_empty_folders(root_folder):
    for dirpath, dirnames, filenames in os.walk(root_folder, topdown=False):
        for dirname in dirnames:
            folder_path = os.path.join(dirpath, dirname)
            # Check if the folder is empty
            if not os.listdir(folder_path):
                os.rmdir(folder_path)
                print(f"Deleted empty folder '{folder_path}'.")

def main(root_folder):
    delete_empty_folders(root_folder)

if __name__ == "__main__":
    root_folder = '/Users/jeremiah/Documents/CrawfordTech'  
    main(root_folder)
