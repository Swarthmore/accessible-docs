import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  Typography,
  Chip,
  CircularProgress,
  Divider,
  Button,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import NoResultsIcon from '@mui/icons-material/SearchOff';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import SchoolIcon from '@mui/icons-material/School';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { api } from "~/utils/api";

// Types
interface HighlightItem {
  field: string;
  snippet: string;
}

interface DocumentItem {
  id: string;
  course_id: string;
  course_name: string;
  semester_code: string;
  semester_full: string;
  department: string;
  folder_name: string;
  document_name: string;
  document_path: string;
  content: string;
  url: string;
}

interface SearchHit {
  document: DocumentItem;
  highlights: HighlightItem[];
}

interface FacetItem {
  value: string;
  count: number;
}

interface SearchResults {
  hits: SearchHit[];
  facet_counts?: {
    semester_code?: FacetItem[];
    department?: FacetItem[];
  };
}

interface DocumentMatch {
  folder: string;
  document: string;
  url: string;
  highlights: string[];
}

interface CourseGroup {
  course: {
    id: string;
    name: string;
    semester: string;
    department: string;
  };
  matchTypes: Set<string>;
  courseMatched: boolean;
  documentMatches: DocumentMatch[];
}

const AdvancedSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<CourseGroup[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchField, setSearchField] = useState(''); // '' means all fields
  const [filters, setFilters] = useState({
    semester_code: '',
    department: ''
  });
  const [facets, setFacets] = useState<{
    semester_code: FacetItem[];
    department: FacetItem[];
  }>({
    semester_code: [],
    department: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [preventHideResults, setPreventHideResults] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);
  
  const router = useRouter();

  // Using tRPC mutation
  const { mutate: search, isLoading } = api.search.search.useMutation({
    onSuccess: (data: SearchResults) => {
      processSearchResults(data);
    },
    onError: (error) => {
      console.error('Search error:', error);
      setResults([]);
    }
  });

  // Process and group search results
  const processSearchResults = (data: SearchResults) => {
    if (!data.hits || data.hits.length === 0) {
      setResults([]);
      return;
    }

    // Group results by course
    const courseGroups: Record<string, CourseGroup> = {};
    
    data.hits.forEach(hit => {
      const { document, highlights } = hit;
      const courseId = document.course_id;
      
      if (!courseGroups[courseId]) {
        courseGroups[courseId] = {
          course: {
            id: courseId,
            name: document.course_name,
            semester: document.semester_full,
            department: document.department
          },
          matchTypes: new Set<string>(),
          courseMatched: false,
          documentMatches: []
        };
      }
      
      // Track what matched in this specific hit
      let documentMatched = false;
      
      if (highlights) {
        highlights.forEach(highlight => {
          const field = highlight.field;
          courseGroups[courseId].matchTypes.add(field);
          
          // Check if this document actually contains a match
          if (field === 'folder_name' || field === 'document_name' || field === 'content') {
            documentMatched = true;
          } else if (field === 'course_name') {
            courseGroups[courseId].courseMatched = true;
          }
        });
      }
      
      // Find highlights for content
      const contentHighlights: string[] = [];
      
      if (highlights) {
        highlights.forEach(highlight => {
          if (highlight.field === 'content') {
            contentHighlights.push(highlight.snippet);
          }
        });
      }
      
      // Only add this document hit if it actually contains a match
      if (documentMatched) {
        courseGroups[courseId].documentMatches.push({
          folder: document.folder_name,
          document: document.document_name,
          url: document.url,
          highlights: contentHighlights
        });
      }
    });

    // Convert to array for rendering
    const groupedResults = Object.values(courseGroups);
    setResults(groupedResults);
    
    // Update facets if available
    if (data.facet_counts) {
      setFacets({
        semester_code: data.facet_counts.semester_code || [],
        department: data.facet_counts.department || []
      });
    }

    // Reset active result index when new results come in
    setActiveResultIndex(-1);
  };

  // Handle search on enter or button click
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setShowResults(true);

    // Build filter string
    const filterClauses: string[] = [];
    Object.entries(filters).forEach(([field, value]) => {
      if (value) {
        filterClauses.push(`${field}:=${value}`);
      }
    });

    // Call tRPC mutation
    search({
      query: searchQuery,
      queryBy: searchField || undefined,
      filterBy: filterClauses.length > 0 ? filterClauses.join(' && ') : undefined,
      facetBy: 'semester_code,department',
      perPage: 20
    });
  };

  // Handle click on a course
  const handleCourseClick = (courseId: string) => {
    router.push(`/${courseId}`);
    setShowResults(false);
  };

  // Handle click on a document
  const handleDocumentClick = (courseId: string, hit: DocumentMatch) => {
    router.push(`/viewer/${courseId}/${encodeURIComponent(hit.folder)}/${encodeURIComponent(hit.document)}`);
  };

  // Handle filter change
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
    
    // Automatically refresh search when filter changes
    setTimeout(() => {
      if (searchQuery) handleSearch();
    }, 100);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      semester_code: '',
      department: ''
    });
    
    // Automatically refresh search when filters cleared
    setTimeout(() => {
      if (searchQuery) handleSearch();
    }, 100);
  };

  // Handle blur of search field
  const handleBlur = (e: React.FocusEvent) => {
    // Don't hide results if we're tabbing to the results list
    if (e.relatedTarget && resultsRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    
    setTimeout(() => {
      if (!preventHideResults) {
        setShowResults(false);
      }
    }, 150);
  };

  // Handle search field type change
  const handleSearchFieldChange = (field: string) => {
    setSearchField(field);
    
    // Automatically refresh search
    setTimeout(() => {
      if (searchQuery) handleSearch();
    }, 100);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setShowResults(false);
    
    // Focus back on the search input after clearing
    searchInputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;
    
    // Down arrow - move to next result
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveResultIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } 
    // Up arrow - move to previous result
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveResultIndex(prev => (prev > 0 ? prev - 1 : 0));
    } 
    // Enter - select current result
    else if (e.key === 'Enter' && activeResultIndex >= 0) {
      e.preventDefault();
      handleCourseClick(results[activeResultIndex].course.id);
    }
    // Escape - close results
    else if (e.key === 'Escape') {
      e.preventDefault();
      setShowResults(false);
    }
  };

  // Focus on active result when it changes
  useEffect(() => {
    if (activeResultIndex >= 0 && resultsRef.current) {
      const activeElement = resultsRef.current.querySelector(`[data-index="${activeResultIndex}"]`);
      if (activeElement) {
        (activeElement as HTMLElement).focus();
      }
    }
  }, [activeResultIndex]);

  // Render filter chip
  const renderFilterChip = (label: string, value: string, filterType: string) => (
    <Chip
      label={`${label}: ${value}`}
      onDelete={() => handleFilterChange(filterType, '')}
      deleteIcon={<Tooltip title="Remove filter"><ClearIcon /></Tooltip>}
      className="m-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200"
      size="small"
      aria-label={`Filter by ${label}: ${value}. Press delete to remove.`}
    />
  );

  // Determine if we should announce results to screen readers
  const getResultsAnnouncement = () => {
    if (isLoading) return "Searching...";
    if (results.length === 0 && searchQuery) return `No results found for "${searchQuery}"`;
    if (results.length > 0) return `Found ${results.length} results for "${searchQuery}"`;
    return "";
  };

  return (
    <div className="relative w-full">
      <Box className="flex flex-col md:flex-row items-center justify-center gap-2 w-full">
        <TextField
          variant="outlined"
          placeholder="Search courses and documents..."
          fullWidth
          inputRef={searchInputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) handleSearch();
            handleKeyDown(e);
          }}
          onBlur={handleBlur}
          onFocus={() => searchQuery && setShowResults(true)}
          className="rounded-lg shadow w-full"
          InputProps={{
            className: "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200",
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-gray-500 dark:text-gray-400" aria-hidden="true" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {isLoading ? (
                  <CircularProgress size={24} className="text-blue-500 dark:text-blue-400" aria-label="Searching..." />
                ) : searchQuery ? (
                  <Tooltip title="Clear search">
                    <IconButton 
                      onClick={handleClearSearch} 
                      aria-label="clear search" 
                      className="focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:focus:outline-blue-400 dark:text-white"
                    >
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                ) : null}
                <Tooltip title={showFilters ? "Hide filters" : "Show filters"}>
                  <IconButton
                    onClick={() => setShowFilters(!showFilters)}
                    aria-label={showFilters ? "hide filters" : "show filters"}
                    aria-expanded={showFilters}
                    aria-controls="filter-panel"
                    className={`focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:focus:outline-blue-400 dark:text-white ml-1 ${showFilters ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                  >
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Search">
                  <IconButton 
                    onClick={handleSearch} 
                    aria-label="search" 
                    className="focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:focus:outline-blue-400 dark:text-white ml-1 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white"
                  >
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          inputProps={{
            className: "text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-300",
            "aria-label": "Search courses and documents",
          }}
          aria-controls={showResults ? "search-results" : undefined}
          aria-expanded={showResults}
        />
      </Box>

      {/* Screen reader announcement for search results */}
      <div className="sr-only" aria-live="polite">
        {getResultsAnnouncement()}
      </div>

      {/* Filter options */}
      {showFilters && (
        <Box 
          id="filter-panel"
          className="bg-white dark:bg-gray-700 p-3 mt-2 rounded-lg shadow-md w-full"
          role="region" 
          aria-label="Search filters"
        >
          <div className="flex flex-wrap items-center justify-between mb-2">
            <Typography variant="h6" className="text-gray-800 dark:text-gray-200 text-sm font-medium">
              Search Filters
            </Typography>
            <Button 
              onClick={handleClearFilters}
              size="small"
              className="text-blue-600 dark:text-blue-400 text-xs"
              startIcon={<ClearIcon fontSize="small" />}
              aria-label="Clear all filters"
            >
              Clear All
            </Button>
          </div>

          <div className="mb-3">
            <Typography variant="subtitle2" className="text-gray-700 dark:text-gray-300 mb-1 text-xs" id="search-field-label">
              Search in:
            </Typography>
            <div className="flex flex-wrap gap-1" role="radiogroup" aria-labelledby="search-field-label">
              <Chip
                label="All Fields"
                onClick={() => handleSearchFieldChange('')}
                className={`${!searchField ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}`}
                size="small"
                aria-pressed={!searchField}
                role="radio"
                tabIndex={!searchField ? 0 : -1}
              />
              <Chip
                label="Course Name Only"
                onClick={() => handleSearchFieldChange('course_name')}
                className={`${searchField === 'course_name' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}`}
                size="small"
                aria-pressed={searchField === 'course_name'}
                role="radio"
                tabIndex={searchField === 'course_name' ? 0 : -1}
              />
              <Chip
                label="Folder Name Only"
                onClick={() => handleSearchFieldChange('folder_name')}
                className={`${searchField === 'folder_name' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}`}
                size="small"
                aria-pressed={searchField === 'folder_name'}
                role="radio"
                tabIndex={searchField === 'folder_name' ? 0 : -1}
              />
              <Chip
                label="Document Name Only"
                onClick={() => handleSearchFieldChange('document_name')}
                className={`${searchField === 'document_name' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}`}
                size="small"
                aria-pressed={searchField === 'document_name'}
                role="radio"
                tabIndex={searchField === 'document_name' ? 0 : -1}
              />
              <Chip
                label="Content Only"
                onClick={() => handleSearchFieldChange('content')}
                className={`${searchField === 'content' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}`}
                size="small"
                aria-pressed={searchField === 'content'}
                role="radio"
                tabIndex={searchField === 'content' ? 0 : -1}
              />
            </div>
          </div>

          {facets.semester_code.length > 0 && (
            <div className="mb-3">
              <Typography variant="subtitle2" className="text-gray-700 dark:text-gray-300 mb-1 text-xs" id="semester-filter-label">
                Semester:
              </Typography>
              <div className="flex flex-wrap gap-1" aria-labelledby="semester-filter-label">
                {facets.semester_code.map((facet, index) => (
                  <Chip
                    key={index}
                    label={`${facet.value} (${facet.count})`}
                    onClick={() => handleFilterChange('semester_code', facet.value)}
                    className={`${filters.semester_code === facet.value ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}`}
                    size="small"
                    aria-pressed={filters.semester_code === facet.value}
                    aria-label={`Filter by semester: ${facet.value} (${facet.count} results)`}
                  />
                ))}
              </div>
            </div>
          )}

          {facets.department.length > 0 && (
            <div>
              <Typography variant="subtitle2" className="text-gray-700 dark:text-gray-300 mb-1 text-xs" id="department-filter-label">
                Department:
              </Typography>
              <div className="flex flex-wrap gap-1" aria-labelledby="department-filter-label">
                {facets.department.map((facet, index) => (
                  <Chip
                    key={index}
                    label={`${facet.value} (${facet.count})`}
                    onClick={() => handleFilterChange('department', facet.value)}
                    className={`${filters.department === facet.value ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}`}
                    size="small"
                    aria-pressed={filters.department === facet.value}
                    aria-label={`Filter by department: ${facet.value} (${facet.count} results)`}
                  />
                ))}
              </div>
            </div>
          )}
        </Box>
      )}

      {/* Active filters display */}
      {(filters.semester_code || filters.department) && (
        <Box className="flex flex-wrap items-center mt-2" role="region" aria-label="Active filters">
          <Typography variant="caption" className="text-gray-600 dark:text-gray-400 mr-1">
            Active filters:
          </Typography>
          {filters.semester_code && renderFilterChip('Semester', filters.semester_code, 'semester_code')}
          {filters.department && renderFilterChip('Department', filters.department, 'department')}
        </Box>
      )}

      {/* Search results */}
      {showResults && (
        <List 
          id="search-results"
          ref={resultsRef}
          className="absolute bg-white dark:bg-gray-800 w-full mt-2 overflow-auto shadow-lg z-20 rounded-md max-h-[80vh] border border-gray-200 dark:border-gray-700"
          onMouseDown={() => setPreventHideResults(true)}
          onMouseUp={() => setPreventHideResults(false)}
          role="listbox"
          aria-label="Search results"
          tabIndex={-1}
        >
          {isLoading ? (
            <div className="flex justify-center items-center p-6">
              <CircularProgress className="text-blue-500 dark:text-blue-400" />
              <span className="sr-only">Loading search results...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((group, groupIndex) => {
              const onlyCourseMatched = group.courseMatched && group.documentMatches.length === 0;
              
              return (
                <div key={groupIndex} className="mb-2">
                  <ListItem 
                    button 
                    onClick={() => handleCourseClick(group.course.id)}
                    className={`hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start ${activeResultIndex === groupIndex ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    tabIndex={0}
                    data-index={groupIndex}
                    role="option"
                    aria-selected={activeResultIndex === groupIndex}
                  >
                    <ListItemIcon>
                      <SchoolIcon className="text-blue-500 dark:text-blue-400 mt-1" aria-hidden="true" />
                    </ListItemIcon>
                    <div className="flex-grow">
                      <ListItemText 
                        primary={
                          <Typography className="text-gray-900 dark:text-white font-medium hover:underline focus:underline">
                            {group.course.name}
                          </Typography>
                        } 
                        secondary={
                          <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                            {group.course.semester} · {group.course.department}
                          </Typography>
                        }
                        aria-label={`Course: ${group.course.name}, ${group.course.semester}, ${group.course.department}`}
                      />
                      
                      {/* For course-only matches, don't show documents */}
                      {!onlyCourseMatched && (
                        <Box className="mt-1">
                          {group.documentMatches.map((hit, hitIndex) => (
                            <Box 
                              key={hitIndex} 
                              className="ml-2 mt-3 border-l-2 border-gray-300 dark:border-gray-500 pl-3"
                            >
                              <Box 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDocumentClick(group.course.id, hit);
                                }}
                                className="cursor-pointer hover:bg-gray-200 dark:hover:bg-black p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                tabIndex={0}
                                role="link"
                                aria-label={`Document: ${hit.folder} / ${hit.document}`}
                              >
                                <Typography className="text-gray-800 dark:text-white text-sm flex items-center">
                                  <InsertDriveFileIcon fontSize="small" className="mr-1 text-amber-500 dark:text-amber-300" aria-hidden="true" />
                                  <span className="font-medium">{hit.folder}</span>
                                  <span className="mx-1 text-gray-500 dark:text-gray-400">/</span>
                                  <span className="font-medium">{hit.document}</span>
                                </Typography>
                                
                                {hit.highlights.length > 0 && (
                                  <Box className="mt-1 text-xs bg-gray-100 dark:bg-gray-600 rounded p-2 border-l-2 border-amber-500 dark:border-amber-400">
                                    <Typography className="flex items-start gap-1">
                                      <FormatQuoteIcon fontSize="small" className="text-amber-500 dark:text-amber-300 mt-0.5" aria-hidden="true" />
                                      <span 
                                        dangerouslySetInnerHTML={{ 
                                          __html: hit.highlights[0] 
                                        }} 
                                        className="text-gray-700 dark:text-gray-200 [&_mark]:bg-yellow-200 dark:[&_mark]:bg-amber-600 [&_mark]:text-gray-900 dark:[&_mark]:text-gray-50 [&_mark]:px-0.5 [&_mark]:rounded-sm"
                                        aria-label={`Preview: ${hit.highlights[0].replace(/<\/?mark>/g, '')}`}
                                      />
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </div>
                  </ListItem>
                  {groupIndex < results.length - 1 && <Divider className="dark:border-gray-700" />}
                </div>
              );
            })
          ) : searchQuery ? (
            <ListItem className="flex justify-center items-center text-gray-600 dark:text-gray-300 py-6">
              <NoResultsIcon className="text-gray-500 dark:text-gray-400 mr-2" aria-hidden="true" />
              <Typography>
                No results found for "{searchQuery}"
              </Typography>
            </ListItem>
          ) : null}
        </List>
      )}
    </div>
  );
};

export default AdvancedSearch;