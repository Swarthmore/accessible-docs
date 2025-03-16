import os
import shutil

def move_completed_folder_contents_to_parent(child_folder_path, parent_folder_path):
    for filename in os.listdir(child_folder_path):
        if filename != '.DS_Store':
            src_path = os.path.join(child_folder_path, filename)
            dst_path = os.path.join(parent_folder_path, filename)

            if os.path.exists(dst_path):
                if os.path.isdir(dst_path):
                    shutil.rmtree(dst_path)
                else:
                    os.remove(dst_path)

            shutil.move(src_path, dst_path)

def delete_specific_folders(parent_folder, folders_to_delete):
    for folder in folders_to_delete:
        folder_path = os.path.join(parent_folder, folder)
        if os.path.isdir(folder_path):
            shutil.rmtree(folder_path)
            print(f"Deleted folder '{folder_path}'.")

def check_direct_subfolders_for_completed(root_folder): 
    subfolders = [f.path for f in os.scandir(root_folder) if f.is_dir()] 
    for folder_path in subfolders:
        subfolder_name = os.path.basename(folder_path)
        
        completed_folder_path1 = os.path.join(folder_path, 'Text to Speech, including image_formula_equation descriptions', 'Completed')
        completed_folder_path2 = os.path.join(folder_path, 'Full Remediation', 'Completed')
        completed_folder_path3 = os.path.join(folder_path, 'Magnification', 'Completed')
        completed_folder_path4 = os.path.join(folder_path, 'Text to Speech, no image_formula_equation descriptions', 'Completed')

        if os.path.exists(completed_folder_path1):
            print(f"Moving contents of '{completed_folder_path1}' to '{folder_path}'.")
            move_completed_folder_contents_to_parent(completed_folder_path1, folder_path)
            delete_specific_folders(folder_path, ['Text to Speech, including image_formula_equation descriptions'])
        
        if os.path.exists(completed_folder_path2):
            print(f"Moving contents of '{completed_folder_path2}' to '{folder_path}'.")
            move_completed_folder_contents_to_parent(completed_folder_path2, folder_path)
            delete_specific_folders(folder_path, ['Full Remediation'])

        if os.path.exists(completed_folder_path3):
            print(f"Moving contents of '{completed_folder_path3}' to '{folder_path}'.")
            move_completed_folder_contents_to_parent(completed_folder_path3, folder_path)
            delete_specific_folders(folder_path, ['Magnification'])

        if os.path.exists(completed_folder_path4):
            print(f"Moving contents of '{completed_folder_path4}' to '{folder_path}'.")
            move_completed_folder_contents_to_parent(completed_folder_path4, folder_path)
            delete_specific_folders(folder_path, ['Text to Speech, no image_formula_equation descriptions'])

def main(root_folder):
    check_direct_subfolders_for_completed(root_folder)

# if __name__ == "__main__":
#     root_folder = '/Users/jeremiah/Documents/A11yGator'  # Replace with your actual root folder path
#     main(root_folder)
