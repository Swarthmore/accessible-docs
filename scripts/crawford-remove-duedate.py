import os
import shutil
import re

def delete_log_files(root_folder):
    for dirpath, dirnames, filenames in os.walk(root_folder):
        for filename in filenames:
            if filename.endswith('LOG.png'):
                file_path = os.path.join(dirpath, filename)
                os.remove(file_path)
                print(f"Deleted file '{file_path}'.")

def move_folder_contents_to_parent(child_folder_path, parent_folder_path):
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

def delete_folder(folder_path):
    if os.path.isdir(folder_path):
        shutil.rmtree(folder_path)
        print(f"Deleted folder '{folder_path}'.")

def check_subfolders(root_folder): 
    subfolders = [f.path for f in os.scandir(root_folder) if f.is_dir()] 
    for course_folder in subfolders:
        course_due_date_folders = [f.path for f in os.scandir(course_folder) if f.is_dir()] 
        for course_due_date_folder in course_due_date_folders:
            course_due_date_folder_name = os.path.basename(course_due_date_folder)
            # Check if the course-due-date folder name contains "Due"
            if re.search(r'\bDue\b', course_due_date_folder_name):
                print(f"Moving contents of '{course_due_date_folder}' to '{course_folder}'.")
                move_folder_contents_to_parent(course_due_date_folder, course_folder)
                print(f"Deleting folder '{course_due_date_folder}'.")
                delete_folder(course_due_date_folder)

def delete_quote_folders(root_folder):
    quote_folder_pattern = re.compile(r'^Quote #\d+$')
    for dirpath, dirnames, filenames in os.walk(root_folder, topdown=False):
        for dirname in dirnames:
            if quote_folder_pattern.match(dirname):
                folder_path = os.path.join(dirpath, dirname)
                delete_folder(folder_path)

def main(root_folder):
    delete_log_files(root_folder)
    delete_quote_folders(root_folder)
    check_subfolders(root_folder)

if __name__ == "__main__":
    root_folder = '/Users/jeremiah/Documents/CrawfordTech'  # Replace with your actual root folder path
    main(root_folder)
