import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { TextField, InputAdornment, IconButton, List, ListItem, ListItemIcon, ListItemText, Box, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import NoResultsIcon from '@mui/icons-material/SearchOff';

interface CourseItem {
  name: string;
  type: 'course' | 'coursefolder';
  children?: CourseItem[];
}

interface SearchBarWithSuggestionsProps {
  jsonData: CourseItem[];
  onSearch: (query: string) => void;
}

const SearchBarWithSuggestions: React.FC<SearchBarWithSuggestionsProps> = ({ jsonData, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CourseItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  let preventHideDropdown = false;
  const router = useRouter();

  useEffect(() => {
    if (searchQuery.length === 0) {
      setSuggestions([]);
    //   setShowSuggestions(false);
      return;
    }
    const searchLowerCase = searchQuery.toLowerCase();
    const newSuggestions: CourseItem[] = [];

    const traverse = (data: CourseItem[]) => {
      data.forEach((item) => {
        if ((item.type === "course" || item.type === "coursefolder") && item.name.toLowerCase().includes(searchLowerCase)) {
          newSuggestions.push(item);
        }
        if (item.children) {
          traverse(item.children);
        }
      });
    };

    traverse(jsonData);
    setSuggestions(newSuggestions);
    // console.log(searchQuery)
    // setShowSuggestions(newSuggestions.length > 0);
  }, [searchQuery, jsonData]);

  const handleBlur = () => {
    setTimeout(() => {
      if (!preventHideDropdown) {
        setShowSuggestions(false);
      }
    }, 100); // 100ms delay to account for the click action
  };

  const handleListItemClick = (name: string) => {
    router.push(`/#${name}`);
    preventHideDropdown = false;
    setShowSuggestions(false);
  };

  const handleSearchButtonClick = () => {
    // onSearch(searchQuery);
    setShowSuggestions(true);
  };

  return (
    <Box className="flex justify-center mx-4 w-full lg:w-4/5 ">
  <TextField
    variant="outlined"
    placeholder="Search"
    fullWidth
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && handleSearchButtonClick()}
    onBlur={handleBlur}
    onFocus={() => setShowSuggestions(true)}
    className="rounded-lg shadow"
    InputProps={{
      className: "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200",
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={handleSearchButtonClick} aria-label="search" tabIndex={0} className="focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:focus:outline-blue-400 dark:text-white">
            <SearchIcon />
          </IconButton>
        </InputAdornment>
      ),
    }}
    // Directly apply styles for the input element
    inputProps={{
      className: "text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-300"
    }}
  />
      {showSuggestions && (
        <List className="absolute bg-white dark:bg-gray-600 mt-[3.7rem] w-full lg:w-4/5 overflow-auto shadow-lg z-20 rounded-md max-h-60">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <ListItem
                button
                key={index}
                onClick={() => handleListItemClick(suggestion.name)}
                className="hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200"
                onMouseDown={() => preventHideDropdown = true}
              >
                <ListItemIcon>
                  {suggestion.type === 'course' ? <FolderIcon className="text-gray-500 dark:text-gray-400" /> : <InsertDriveFileIcon className="text-gray-500 dark:text-gray-400" />}
                </ListItemIcon>
                <ListItemText primary={suggestion.name} />
              </ListItem>
            ))
          ) : searchQuery && (
            // "No Results" message with adjusted dark mode styles for visibility
            <ListItem className="flex justify-center items-center text-gray-600 dark:text-gray-200">
              <ListItemIcon>
                <NoResultsIcon color="action" className="text-gray-500 dark:text-gray-400" />
              </ListItemIcon>
              <Typography variant="subtitle1" className="text-center">
                No result matches your search
              </Typography>
            </ListItem>
          )}
        </List>
      )}
    </Box>
  );
  
};

export default SearchBarWithSuggestions;
