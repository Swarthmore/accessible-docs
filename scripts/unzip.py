import os
import zipfile

def unzip_all_zips(root_folder):
    for dirpath, dirnames, filenames in os.walk(root_folder):
        for filename in filenames:
            if filename.endswith('.zip'):
                zip_filepath = os.path.join(dirpath, filename)
                try:
                    with zipfile.ZipFile(zip_filepath, 'r') as zip_ref:
                        zip_ref.extractall(dirpath)
                    os.remove(zip_filepath)
                    print(f"Unzipped '{filename}'.")
                except zipfile.BadZipFile:
                    print(f"Skipping '{filename}': not a zip file or it is corrupted.")

def main(root_folder):
    unzip_all_zips(root_folder)
