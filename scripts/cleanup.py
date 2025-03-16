# cleanup.py
import sys
from delete_irrelevant_folders import main as delete_main
from move_to_root_folder import main as move_main
from unzip import main as unzip_main
from rename_and_restructure_html_files import main as rename_main

def cleanup(root_folder):
    delete_main(root_folder)
    move_main(root_folder)
    unzip_main(root_folder)
    rename_main(root_folder)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 cleanup.py <root_folder>")
        sys.exit(1)  # Exit the script if the root_folder argument is not provided

    root_folder = sys.argv[1]  # Get the root folder from the command line
    cleanup(root_folder)
