import os
import shutil

def delete_empty_folders(root_folder):
    for dirpath, dirnames, filenames in os.walk(root_folder, topdown=False):
        for dirname in dirnames:
            folder_path = os.path.join(dirpath, dirname)
            if not any(os.scandir(folder_path)):
                os.rmdir(folder_path)

def check_and_delete_if_no_completed_subfolder(root_folder): 
    subfolders = [f.path for f in os.scandir(root_folder) if f.is_dir()] 
    for folder_path in subfolders:
        subfolder_name = os.path.basename(folder_path)
        completed_folder_path1 = os.path.join(folder_path, 'Text to Speech, including image_formula_equation descriptions', 'Completed')
        completed_folder_path2 = os.path.join(folder_path, 'Full Remediation', 'Completed')
        completed_folder_path3 = os.path.join(folder_path, 'Magnification', 'Completed')
        completed_folder_path4 = os.path.join(folder_path, 'Text to Speech, no image_formula_equation descriptions', 'Completed')

        if not os.path.exists(completed_folder_path1) and not os.path.exists(completed_folder_path2) and not os.path.exists(completed_folder_path3) and not os.path.exists(completed_folder_path4):
            print(f"Deleting folder '{subfolder_name}' as it doesn't have any child folders named 'Completed'.")
            shutil.rmtree(folder_path)

def main(root_folder):
    delete_empty_folders(root_folder)
    check_and_delete_if_no_completed_subfolder(root_folder)

# if __name__ == "__main__":
#     import sys
#     if len(sys.argv) != 2:
#         print("Usage: python3 script_name.py <root_folder>")
#         sys.exit(1)  # Exit the script if the root_folder argument is not provided

#     root_folder = sys.argv[1]  # Get the root folder from the command line
#     main(root_folder)
