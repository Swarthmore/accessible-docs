import os
from bs4 import BeautifulSoup
import shutil

def rename_html_directories(root_folder):
    for dirpath, dirnames, filenames in os.walk(root_folder, topdown=False):
        for dirname in dirnames:
            if dirname.endswith('.html'):
                old_dirpath = os.path.join(dirpath, dirname)
                new_dirpath = os.path.join(dirpath, dirname[:-5])  # Remove the last 5 characters, ".html"
                os.rename(old_dirpath, new_dirpath)
                print(f"Renamed directory '{old_dirpath}' to '{new_dirpath}'.")

def rename_html_files(root_folder):
    for dirpath, dirnames, filenames in os.walk(root_folder):
        for filename in filenames:
            if filename.endswith('.html') or filename.endswith('.htm'):
                filepath = os.path.join(dirpath, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as file:
                        html_contents = file.read()
                except UnicodeDecodeError:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                        html_contents = file.read()

                soup = BeautifulSoup(html_contents, 'html.parser')
                title_tag = soup.title

                if title_tag and title_tag.string:
                    title = title_tag.string.replace('/', '_').replace('\\', '_').replace(':', '_').replace('*', '_').replace('?', '_').replace('<', '_').replace('>', '_').replace('|', '_')
                    new_filename = f"{title}.html"
                    new_filepath = os.path.join(dirpath, new_filename)

                    # Ensure the new filename does not already exist in the directory
                    if not os.path.exists(new_filepath):
                        os.rename(filepath, new_filepath)
                    else:
                        print(f"Error: File '{new_filepath}' already exists.")
                else:
                    print(f"Error: No title tag found in '{filepath}'.")

def move_html_files_to_own_folder(root_folder):
    for dirpath, dirnames, filenames in os.walk(root_folder):
        # Check if we are in a coursefolder (by checking the depth of the current path)
        depth = dirpath[len(root_folder):].count(os.sep)
        if depth == 1:  # Adjust this value depending on your actual folder structure
            for filename in filenames:
                if filename.endswith('.html') or filename.endswith('.htm'):
                    # Create a new directory with the same name as the HTML file (without extension)
                    new_dir_name = os.path.splitext(filename)[0]
                    new_dir_path = os.path.join(dirpath, new_dir_name)
                    os.makedirs(new_dir_path, exist_ok=True)
                    
                    # Move the HTML file to the new directory
                    old_file_path = os.path.join(dirpath, filename)
                    new_file_path = os.path.join(new_dir_path, filename)
                    shutil.move(old_file_path, new_file_path)

                    print(f"Moved '{old_file_path}' to '{new_file_path}'.")

def main(root_folder):
    rename_html_files(root_folder)
    rename_html_directories(root_folder)
    move_html_files_to_own_folder(root_folder)

# if __name__ == "__main__":
#     import sys
#     if len(sys.argv) != 2:
#         print("Usage: python3 rename_and_restructure_html_files.py <root_folder>")
#         sys.exit(1)  # Exit the script if the root_folder argument is not provided

#     root_folder = sys.argv[1]  # Get the root folder from the command line
#     main(root_folder)
