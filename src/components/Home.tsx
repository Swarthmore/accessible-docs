import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import NoResults from './NoResults';
import Star from './Star';

// Types for our data structure
type SemesterInfo = {
  code: string;
  season: string;
  year: string;
  full: string;
};

type CourseInfo = {
  dept: string[];
  number: string[];
  full: string;
};

type CourseItem = {
  type: string;
  name: string;
  semester?: SemesterInfo;
  course?: CourseInfo;
  children?: CourseItem[];
};

interface HomeProps {
  data: CourseItem[];
}

// Function to compare semester codes for sorting
// Format is like F22 (Fall 2022), S23 (Spring 2023), etc.
const compareSemesters = (a: string, b: string): number => {
  // Extract season (F, S) and year (22, 23, etc.)
  const seasonA = a.charAt(0);
  const seasonB = b.charAt(0);
  const yearA = parseInt(a.substring(1));
  const yearB = parseInt(b.substring(1));
  
  // Compare years first (newer years come first)
  if (yearA !== yearB) {
    return yearB - yearA;
  }
  
  // If same year, sort by season (Spring comes before Fall in same year when sorting newest first)
  // Since Spring is earlier in the year than Fall, when sorting newest first,
  // Fall should come before Spring for the same year
  if (seasonA === seasonB) {
    return 0;
  }
  return seasonA === 'F' ? -1 : 1; // Fall comes before Spring in same year when sorting descending
};

const Home: React.FC<HomeProps> = ({ data }) => {
  const router = useRouter();
  const [starredCourses, setStarredCourses] = useState<string[]>([]);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  
  // Load starred courses from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('starredCourses') || '[]');
      setStarredCourses(stored);
    }
  }, []);
  
  // Filter only course type items
  const courses = data.filter(item => item.type === 'course');
  
  // Extract unique semesters for the filter
  const semesters = React.useMemo(() => {
    const semesterSet = new Set<string>();
    courses.forEach(course => {
      if (course.semester?.full) {
        semesterSet.add(course.semester.full);
      }
    });
    
    // Convert to array and sort
    return Array.from(semesterSet).sort((a, b) => {
      // Extract season and year
      const aMatch = a.match(/(Spring|Fall) (\d{4})/);
      const bMatch = b.match(/(Spring|Fall) (\d{4})/);
      
      if (!aMatch || !bMatch) return 0;
      
      const [, aSeason, aYear] = aMatch;
      const [, bSeason, bYear] = bMatch;
      
      // Compare years first
      if (aYear !== bYear) {
        return parseInt(bYear) - parseInt(aYear); // Descending
      }
      
      // Same year, compare seasons
      if (aSeason === bSeason) return 0;
      return aSeason === 'Fall' ? -1 : 1; // Fall comes before Spring
    });
  }, [courses]);
  
  // Sort courses chronologically (newest first)
  const sortedCourses = [...courses].sort((a, b) => {
    if (a.semester?.code && b.semester?.code) {
      return compareSemesters(a.semester.code, b.semester.code);
    }
    return 0;
  });

  // Apply filters: starred and semester
  const displayedCourses = sortedCourses.filter(course => {
    // Filter by starred status
    if (showStarredOnly && !starredCourses.includes(course.name)) {
      return false;
    }
    
    // Filter by semester
    if (selectedSemester !== 'all' && course.semester?.full !== selectedSemester) {
      return false;
    }
    
    return true;
  });

  // Handle clicking on a course button
  const navigateToCourse = (courseName: string) => {
    // Find the matching course
    const course = courses.find(item => item.name === courseName);
    if (course?.children && course.children.length > 0) {
      // Navigate to the first document of the first folder in the course
      const firstFolder = course.children[0];
      if (firstFolder.children && firstFolder.children.length > 0) {
        const firstFile = firstFolder.children.find(file => file.name.endsWith('.html'));
        if (firstFile) {
          router.push(`/${courseName}`);
        }
      }
    }
  };

  // Handle toggling star for a course
  const handleStarToggle = (courseId: string, isStarred: boolean) => {
    const newStarredCourses = isStarred
      ? [...starredCourses, courseId]
      : starredCourses.filter(id => id !== courseId);
    
    setStarredCourses(newStarredCourses);
    localStorage.setItem('starredCourses', JSON.stringify(newStarredCourses));
  };
  
  // Handle clearing all filters
  const clearFilters = () => {
    setShowStarredOnly(false);
    setSelectedSemester('all');
  };

  return (
    <Container>
      <h1 className="text-center text-3xl font-bold mb-5 dark:text-white">
        Welcome to the Swarthmore Accessible Docs!
      </h1>
      
      <h5 className="text-center mb-6 dark:text-gray-200" aria-live="polite">
      Your go-to resource for inclusive course materials. Find accessible notes and materials, and enjoy reading in light or dark mode, enhancing your learning experience.
      </h5>

      <FilterSection>
        <FilterContainer>
          <FilterLabel>View:</FilterLabel>
          <FilterButton 
            active={!showStarredOnly} 
            onClick={() => setShowStarredOnly(false)}
            aria-pressed={!showStarredOnly}
            aria-label="Show all courses"
          >
            All Courses
          </FilterButton>
          <FilterButton 
            active={showStarredOnly} 
            onClick={() => setShowStarredOnly(true)}
            aria-pressed={showStarredOnly}
            aria-label="Show starred courses only"
          >
            Starred
          </FilterButton>
        </FilterContainer>
        
        <FilterContainer>
          <FilterLabel>Semester:</FilterLabel>
          <SelectWrapper>
            <select 
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              aria-label="Filter by semester"
              className="dark:bg-gray-800 dark:text-white border dark:border-gray-700 rounded p-2"
            >
              <option value="all">All Semesters</option>
              {semesters.map(semester => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </SelectWrapper>
        </FilterContainer>
        
        {(showStarredOnly || selectedSemester !== 'all') && (
          <ClearFiltersButton 
            onClick={clearFilters}
            aria-label="Clear all filters"
          >
            Clear Filters
          </ClearFiltersButton>
        )}
      </FilterSection>
      
      {displayedCourses.length === 0 ? (
        <div className="flex justify-center items-center h-[calc(100vh-300px)]">
          {showStarredOnly ? (
            <NoResults description="No starred courses match your filters. Click the star icon on course cards to add favorites." />
          ) : (
            <NoResults description="No courses match your current filters." />
          )}
        </div>
      ) : (
        <CourseGrid>
          {displayedCourses.map((course, index) => {
            // Calculate document count
            const documentCount = course.children?.reduce((count, folder) => {
              const htmlFiles = folder.children?.filter(file => 
                file.name?.endsWith('.html')
              ).length || 0;
              return count + htmlFiles;
            }, 0);
            
            return (
              <CourseCard 
                key={course.name}
                aria-label={`${course.semester?.full} ${course.course?.full} course card`}
                className="course-card"
                tabIndex={0}
              >
                <StarWrapper>
                  <Star 
                    courseId={course.name} 
                    onToggle={handleStarToggle}
                  />
                </StarWrapper>
                
                <div className="folder" aria-hidden="true">
                  <div className="front-side">
                    <div className="tip" />
                    <div className="cover">
                      <div className="course-code">
                        {course.course?.full}
                      </div>
                    </div>
                  </div>
                  <div className="back-side cover" />
                </div>
                <div className="semester-tag" aria-label={`Semester: ${course.semester?.full}`}>
                  {course.semester?.full}
                </div>
                <div className="doc-count" aria-label={`Contains ${documentCount} ${documentCount === 1 ? 'document' : 'documents'}`}>
                  {documentCount} {documentCount === 1 ? 'document' : 'documents'}
                </div>
                <div className="custom-file-upload">
                  <button 
                    onClick={() => navigateToCourse(course.name)}
                    aria-label={`View ${course.course?.full} course materials from ${course.semester?.full}`}
                  >
                    <span>View Course</span>
                    <span className="icon" aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="svg-icon">
                        <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
                      </svg>
                    </span>
                  </button>
                </div>
              </CourseCard>
            );
          })}
        </CourseGrid>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const FilterLabel = styled.span`
  font-weight: 500;
  color: #555;
  
  .dark & {
    color: #aaa;
  }
`;

const SelectWrapper = styled.div`
  select {
    border-radius: 6px;
    border: 1px solid #ccc;
    padding: 0.5rem;
    background-color: white;
    min-width: 200px;
    font-size: 1rem;
    
    &:focus {
      outline: 2px solid #FFD700;
      border-color: transparent;
    }
    
    .dark & {
      background-color: #1e293b;
      border-color: #4b5563;
      color: white;
    }
  }
`;

const ClearFiltersButton = styled.button`
  background-color: transparent;
  color: #b43135;
  border: 1px solid #b43135;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(180, 49, 53, 0.1);
  }
  
  &:focus-visible {
    outline: 2px solid #FFD700;
    outline-offset: 2px;
  }
  
  .dark & {
    color: #ff9a9e;
    border-color: #ff9a9e;
    
    &:hover {
      background-color: rgba(255, 154, 158, 0.1);
    }
  }
`;

interface FilterButtonProps {
  active: boolean;
}

const FilterButton = styled.button<FilterButtonProps>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  background-color: ${props => props.active ? '#b43135' : 'transparent'};
  color: ${props => props.active ? 'white' : '#555'};
  border: 1px solid ${props => props.active ? '#b43135' : '#ccc'};
  transition: all 0.3s ease;
  font-size: 0.9rem;
  
  &:hover {
    background-color: ${props => props.active ? '#9a2a2e' : '#f0f0f0'};
  }
  
  &:focus-visible {
    outline: 2px solid #FFD700;
    outline-offset: 2px;
  }
  
  .dark & {
    background-color: ${props => props.active ? '#1a2036' : 'transparent'};
    color: ${props => props.active ? 'white' : '#aaa'};
    border-color: ${props => props.active ? '#1a2036' : '#555'};
    
    &:hover {
      background-color: ${props => props.active ? '#111827' : '#333'};
    }
  }
`;

const StarWrapper = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
  width: 40px;
  height: 40px;
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const CourseCard = styled.div`
  --transition: 350ms;
  --folder-W: 120px;
  --folder-H: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: linear-gradient(135deg, #b43135, #9a2a2e);
  border-radius: 15px;
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.4);
  height: 380px;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  /* Dark mode styles */
  .dark & {
    background: linear-gradient(135deg, #1a2036, #111827);
    box-shadow: 0 20px 30px rgba(0, 0, 0, 0.6);
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 40px rgba(0, 0, 0, 0.5);
    
    .dark & {
      box-shadow: 0 25px 40px rgba(0, 0, 0, 0.7);
    }
  }
  
  &:focus-visible {
    outline: 3px solid #FFD700;
    transform: translateY(-5px);
    
    .dark & {
      outline-color: #FFB700;
    }
  }
  
  .folder {
    position: absolute;
    top: 20px;
    left: calc(50% - 60px);
    animation: float 2.5s infinite ease-in-out;
    transition: transform var(--transition) ease;
  }
  
  .folder:hover {
    transform: scale(1.05);
  }
  
  .folder .front-side,
  .folder .back-side {
    position: absolute;
    transition: transform var(--transition);
    transform-origin: bottom center;
  }
  
  .folder .back-side::before,
  .folder .back-side::after {
    content: "";
    display: block;
    background-color: white;
    opacity: 0.5;
    z-index: 0;
    width: var(--folder-W);
    height: var(--folder-H);
    position: absolute;
    transform-origin: bottom center;
    border-radius: 15px;
    transition: transform 350ms;
    z-index: 0;
    
    .dark & {
      background-color: #e5e7eb;
    }
  }
  
  &:hover .back-side::before {
    transform: rotateX(-5deg) skewX(5deg);
  }
  
  &:hover .back-side::after {
    transform: rotateX(-15deg) skewX(12deg);
  }
  
  .folder .front-side {
    z-index: 1;
  }
  
  &:hover .front-side {
    transform: rotateX(-40deg) skewX(15deg);
  }
  
  .folder .tip {
    background: linear-gradient(135deg, #FF9A56, #FF6F56);
    width: 80px;
    height: 20px;
    border-radius: 12px 12px 0 0;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    position: absolute;
    top: -10px;
    z-index: 2;
    
    .dark & {
      background: linear-gradient(135deg, #FF7A36, #FF4F36);
    }
  }
  
  .folder .cover {
    background: linear-gradient(135deg, #FFE563, #FFC663);
    width: var(--folder-W);
    height: var(--folder-H);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .dark & {
      background: linear-gradient(135deg, #FFD533, #FFB633);
    }
  }
  
  .course-code {
    font-size: 1.1rem;
    font-weight: bold;
    color: #333;
    text-align: center;
    max-width: 90%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .semester-tag {
    background-color: #FFD700;
    color: #333;
    font-weight: bold;
    padding: 6px 12px;
    border-radius: 20px;
    position: absolute;
    bottom: 120px;
    
    .dark & {
      background-color: #FFB700;
    }
  }
  
  .doc-count {
    color: #FFFFFF;
    font-size: 0.9rem;
    position: absolute;
    bottom: 90px;
    
    .dark & {
      color: #e5e7eb;
    }
  }
  
  .custom-file-upload {
    font-size: 1.1em;
    color: #FFFFFF;
    text-align: center;
    background: rgba(0, 0, 0, 0.25);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background var(--transition) ease;
    display: inline-block;
    width: 100%;
    padding: 0;
    position: absolute;
    bottom: 0;
    margin: 0;
    overflow: hidden;
    
    .dark & {
      background: rgba(255, 255, 255, 0.1);
    }
  }
  
  .custom-file-upload:hover {
    background: rgba(0, 0, 0, 0.35);
    
    .dark & {
      background: rgba(255, 255, 255, 0.2);
    }
  }
  
  button {
    font-size: 18px;
    color: white;
    font-family: inherit;
    font-weight: 400;
    cursor: pointer;
    position: relative;
    border: none;
    background: none;
    transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
    transition-duration: 400ms;
    transition-property: color;
    display: inline-flex;
    align-items: center;
    width: 100%;
    justify-content: center;
    padding: 15px;
    
    .dark & {
      color: #e5e7eb;
    }
  }
  
  button:focus,
  button:hover {
    color: #FFD700;
    
    .dark & {
      color: #FFB700;
    }
  }
  
  button:focus-visible {
    outline: 2px solid #FFD700;
    outline-offset: -2px;
    border-radius: 8px;
    
    .dark & {
      outline-color: #FFB700;
    }
  }
  
  button:focus:after,
  button:hover:after {
    width: 100%;
  }
  
  button:after {
    content: "";
    pointer-events: none;
    bottom: -2px;
    left: 0;
    position: absolute;
    width: 0%;
    height: 2px;
    background-color: #FFD700;
    transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
    transition-duration: 500ms;
    transition-property: width;
    
    .dark & {
      background-color: #FFB700;
    }
  }
  
  .svg-icon {
    width: 0.9em;
    height: 0.8em;
    margin-left: 10px;
    fill: white;
    transform: rotate(-45deg);
    transition: transform 0.2s ease-out;
    
    .dark & {
      fill: #e5e7eb;
    }
  }
  
  button:hover .svg-icon {
    transform: rotate(0deg);
    fill: #FFD700;
    
    .dark & {
      fill: #FFB700;
    }
  }
  
  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-3px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;

export default Home;