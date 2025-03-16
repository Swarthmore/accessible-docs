import os
import shutil

def delete_specified_folders(root_folder, folders_to_delete):
    """Delete all folders with specified names in the directory."""
    for dirpath, dirnames, _ in os.walk(root_folder, topdown=False):
        for dirname in dirnames:
            if dirname in folders_to_delete:
                folder_path = os.path.join(dirpath, dirname)
                shutil.rmtree(folder_path)
                print(f"Deleted specified folder '{folder_path}'.")

def delete_macosx_folders(root_folder):
    """Delete all folders named '__MACOSX' in the directory."""
    for dirpath, dirnames, _ in os.walk(root_folder, topdown=False):
        for dirname in dirnames:
            if dirname == '__MACOSX':
                folder_path = os.path.join(dirpath, dirname)
                shutil.rmtree(folder_path)
                print(f"Deleted '__MACOSX' folder '{folder_path}'.")

def has_files(path):
    """Check if the directory has at least one file."""
    for _, _, filenames in os.walk(path):
        if filenames:
            return True
    return False

def move_subfolders_up_if_parent_has_no_files(course_folder):
    """Move subfolders with files up one level if their parent folder doesn't contain files."""
    for dirpath, dirnames, filenames in os.walk(course_folder, topdown=True):
        # Skip directories that contain files
        if filenames:
            continue

        parent_folder = os.path.dirname(dirpath)
        if parent_folder == course_folder:
            continue  # Skip the root course folder itself

        # Move subfolders up if parent has no files
        if not has_files(parent_folder):
            for dirname in dirnames:
                subfolder_path = os.path.join(dirpath, dirname)
                if has_files(subfolder_path):
                    print(f"Moving '{subfolder_path}' to '{parent_folder}'")
                    move_folder_contents_to_parent(subfolder_path, parent_folder)
                    delete_folder(subfolder_path)

def move_folder_contents_to_parent(child_folder_path, parent_folder_path):
    """Move the contents of the child folder to the parent folder."""
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
            print(f"Moved '{src_path}' to '{dst_path}'.")

def delete_folder(folder_path):
    """Delete the specified folder."""
    if os.path.isdir(folder_path):
        shutil.rmtree(folder_path)
        print(f"Deleted folder '{folder_path}'.")

def delete_empty_folders(root_folder):
    """Delete all empty folders in the directory."""
    for dirpath, dirnames, _ in os.walk(root_folder, topdown=False):
        for dirname in dirnames:
            folder_path = os.path.join(dirpath, dirname)
            if not os.listdir(folder_path):
                os.rmdir(folder_path)
                print(f"Deleted empty folder '{folder_path}'.")

def reorganize_course_folders(root_folder):
    """Reorganize the course folders in the specified root directory."""
    course_folders = [f.path for f in os.scandir(root_folder) if f.is_dir()]
    for course_folder in course_folders:
        print(f"Reorganizing course folder: {course_folder}")
        move_subfolders_up_if_parent_has_no_files(course_folder)
        delete_empty_folders(course_folder)

def main(root_folder):
    folders_to_delete = [
        'Text to Speech, including image_formula_equation descriptions',
        'Full Remediation',
        'Magnification',
        'Text to Speech, no image_formula_equation descriptions'
    ]
    delete_specified_folders(root_folder, folders_to_delete)
    delete_macosx_folders(root_folder)
    reorganize_course_folders(root_folder)

if __name__ == "__main__":
    root_folder = '/Users/jeremiah/Documents/A11yGator'  # Replace with your actual root folder path
    main(root_folder)
