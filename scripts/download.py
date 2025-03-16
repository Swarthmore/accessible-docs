from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google.oauth2.service_account import Credentials
import io
import os

# The scope for the OAuth2 request.
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

# The path to the service account credential file
SERVICE_ACCOUNT_FILE = 'credentials.json'

def authenticate_gdrive_api():
    try:
        credentials = Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        print("Authenticated successfully.")
        return build('drive', 'v3', credentials=credentials)
    except Exception as e:
        print(f"Error authenticating Google Drive API: {e}")
        return None

def download_file(service, file_id, filepath, mime_type):
    if os.path.isfile(filepath):
        print(f"File already exists, skipping: {filepath}")
        return

    print(f"Preparing to download file: {filepath} with MIME type: {mime_type}")

    try:
        request = service.files().get_media(fileId=file_id)
        fh = io.FileIO(filepath, 'wb')
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            try:
                status, done = downloader.next_chunk()
                if status:
                    print(f"Download {int(status.progress() * 100)}%.")
            except Exception as e:
                print(f"Error downloading file: {e}")
                break

        if done:
            print(f"Downloaded file: {filepath}")
    except Exception as e:
        print(f"Exception during file download: {e}")

def list_files_in_folder(service, folder_id):
    page_token = None
    all_files = []
    while True:
        try:
            response = service.files().list(q=f"'{folder_id}' in parents and trashed = false",
                                            spaces='drive',
                                            fields='nextPageToken, files(id, name, mimeType)',
                                            pageToken=page_token).execute()

            files = response.get('files', [])
            all_files.extend(files)
            page_token = response.get('nextPageToken', None)
            if not page_token:
                break
        except Exception as e:
            print(f"An error occurred: {e}")
            break
    return all_files

def download_folder(service, folder_id, destination_folder):
    if not os.path.exists(destination_folder):
        os.makedirs(destination_folder)

    files = list_files_in_folder(service, folder_id)
    print(f"Found {len(files)} files in folder {folder_id}.")

    for file in files:
        print(f"Processing file: {file['name']} with MIME type: {file['mimeType']}")
        safe_file_name = file['name'].replace("/", "_")
        file_path = os.path.join(destination_folder, safe_file_name)
        if file['mimeType'] == 'application/vnd.google-apps.folder':
            download_folder(service, file['id'], file_path)
        elif file['mimeType'] in ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.google-apps.document']:
            print(f"Skipping file: {file['name']} with MIME type: {file['mimeType']}")
        else:
            download_file(service, file['id'], file_path, file['mimeType'])

def list_all_files(service):
    page_token = None
    all_files = []
    while True:
        try:
            response = service.files().list(q="trashed = false and 'root' in parents",
                                            spaces='drive',
                                            fields='nextPageToken, files(id, name, mimeType)',
                                            pageToken=page_token).execute()

            files = response.get('files', [])
            all_files.extend(files)
            page_token = response.get('nextPageToken', None)
            if not page_token:
                break
        except Exception as e:
            print(f"An error occurred: {e}")
            break
    return all_files

def download_all_files(service, destination_folder):
    if not os.path.exists(destination_folder):
        os.makedirs(destination_folder)

    files = list_all_files(service)
    print(f"Found {len(files)} files in the Drive.")

    for file in files:
        print(f"Processing file: {file['name']} with MIME type: {file['mimeType']}")
        safe_file_name = file['name'].replace("/", "_")
        file_path = os.path.join(destination_folder, safe_file_name)
        if file['mimeType'] == 'application/vnd.google-apps.folder':
            download_folder(service, file['id'], file_path)
        elif file['mimeType'] in ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.google-apps.document']:
            print(f"Skipping file: {file['name']} with MIME type: {file['mimeType']}")
        else:
            download_file(service, file['id'], file_path, file['mimeType'])

def main():
    destination_folder = "/Users/jeremiah/Documents/a11yfiles"  # Replace with the local destination folder path
    service = authenticate_gdrive_api()
    
    if service:
        print("Starting download...")
        download_all_files(service, destination_folder)
        print("Download completed.")
    else:
        print("Failed to authenticate with Google Drive API.")

if __name__ == '__main__':
    main()
