import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Star from './Star';

// Define styled components that will be used in the component
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  background: transparent;
  border: none;
  color: #b43135;
  font-weight: 500;
  padding: 0.5rem;
  margin-bottom: 1.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: #9a2a2e;
    text-decoration: underline;
  }
  
  &:focus-visible {
    outline: 2px solid #FFD700;
    outline-offset: 2px;
  }
  
  .dark & {
    color: #ff9a9e;
    
    &:hover {
      color: #ff7a7e;
    }
  }
`;

const BackArrow = styled.span`
  margin-right: 0.5rem;
  font-size: 1.2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 1.5rem;
  
  .dark & {
    border-bottom-color: #333;
  }
`;

const SemesterTag = styled.div`
  display: inline-block;
  background-color: #FFD700;
  color: #333;
  font-weight: bold;
  padding: 6px 12px;
  border-radius: 20px;
  margin-top: 0.5rem;
  
  .dark & {
    background-color: #FFB700;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
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

const DocumentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DocumentCard = styled.div`
  --transition: 350ms;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 15px;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  height: 100%;
  min-height: 180px;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  
  /* Dark mode styles */
  .dark & {
    background: #1e293b;
    box-shadow: 0 15px 25px rgba(0, 0, 0, 0.4);
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
    
    .dark & {
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
  }
  
  &:focus-visible {
    outline: 3px solid #FFD700;
    transform: translateY(-5px);
    
    .dark & {
      outline-color: #FFB700;
    }
  }
`;

const StarWrapper = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10;
  width: 30px;
  height: 30px;
`;

const DocumentIconWrapper = styled.div`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  width: 40px;
  height: 40px;
  color: #b43135;
  
  .dark & {
    color: #FFB700;
  }
  
  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
`;

const DocumentContent = styled.div`
  padding: 1.5rem 1.5rem 5rem 5rem;
  padding-right: 3.5rem; /* Add extra padding on the right for the star */
  flex: 1;
`;

const DocumentTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding-right: 1rem; /* Add padding to prevent text from going under the star */
  
  .dark & {
    color: #e5e7eb;
  }
`;

const DocumentSubtitle = styled.p`
  font-size: 0.9rem;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  .dark & {
    color: #9ca3af;
  }
`;

const ReadButton = styled.button`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b43135;
  font-weight: 500;
  transition: background 0.3s ease, color 0.3s ease;
  border: none;
  cursor: pointer;
  width: 100%;
  
  &:hover {
    background: #b43135;
    color: white;
    
    .dark & {
      background: #1a2036;
    }
  }
  
  &:focus-visible {
    outline: 2px solid #FFD700;
    outline-offset: -2px;
    z-index: 1;
    background: #b43135;
    color: white;
    
    .dark & {
      outline-color: #FFB700;
      background: #1a2036;
    }
  }
  
  .dark & {
    background: rgba(255, 255, 255, 0.05);
    color: #FFB700;
  }
  
  .icon {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-left: 8px;
    
    svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
      transform: rotate(-45deg);
      transition: transform 0.2s ease-out;
    }
  }
  
  &:hover .icon svg,
  &:focus-visible .icon svg {
    transform: rotate(2deg);
  }
`;

// NoResults component
const NoResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin: 2rem auto;
  max-width: 500px;
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  color: #b43135;
  margin-bottom: 1rem;
  
  .dark & {
    color: #ff9a9e;
  }
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
  
  .dark & {
    color: #e5e7eb;
  }
`;

const Description = styled.p`
  color: #666;
  
  .dark & {
    color: #9ca3af;
  }
`;

// Define the NoResults component
const NoResults = ({ description }) => (
  <NoResultsContainer aria-live="polite">
    <IconWrapper aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    </IconWrapper>
    <Title>No Documents Found</Title>
    <Description>{description}</Description>
  </NoResultsContainer>
);

// Component props
interface CourseContentProps {
  courseData: any;
  courseName: string;
}

const CourseContent: React.FC<CourseContentProps> = ({ courseData, courseName }) => {
  const router = useRouter();
  const [starredDocuments, setStarredDocuments] = useState<string[]>([]);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  
  // Load starred documents from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('starredDocuments') || '[]');
      setStarredDocuments(stored);
    }
  }, []);
  
  if (!courseData?.children) {
    return (
      <Container>
        <NoResults description="No documents found for this course." />
      </Container>
    );
  }

  // Handle starring a document
  const handleStarToggle = (docId: string, isStarred: boolean) => {
    // Get current starred documents
    const newStarredDocuments = isStarred
      ? [...starredDocuments, docId]
      : starredDocuments.filter(id => id !== docId);
    
    // Update localStorage
    localStorage.setItem('starredDocuments', JSON.stringify(newStarredDocuments));
    
    // Update state
    setStarredDocuments(newStarredDocuments);
  };
  // Navigate to document viewer
  const navigateToDocument = (folderName: string, fileName: string) => {
    router.push(`/viewer/${courseName}/${encodeURIComponent(folderName)}/${encodeURIComponent(fileName)}`);
  };

  return (
    <Container>
      <BackButton onClick={() => router.push('/')}>
        <BackArrow aria-hidden="true">←</BackArrow> Back to All Courses
      </BackButton>
      
      <Header>
        <h1 className="text-3xl font-bold mb-2 dark:text-white">
          {courseData.course?.full || courseName}
        </h1>
        <SemesterTag aria-label={`Semester: ${courseData.semester?.full}`}>
          {courseData.semester?.full}
        </SemesterTag>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          Browse available documents for this course. Click on a document to view its contents.
        </p>
        
        <FilterBar>
          <FilterButton 
            active={!showStarredOnly} 
            onClick={() => setShowStarredOnly(false)}
            aria-pressed={!showStarredOnly}
            aria-label="Show all documents"
          >
            All Documents
          </FilterButton>
          <FilterButton 
            active={showStarredOnly} 
            onClick={() => setShowStarredOnly(true)}
            aria-pressed={showStarredOnly}
            aria-label="Show starred documents only"
          >
            Starred
          </FilterButton>
        </FilterBar>
      </Header>

      <DocumentGrid>
        {courseData.children.map((folder, folderIndex) => {
          // Filter only HTML files
          const htmlFiles = folder.children?.filter(file => 
            file.type === 'file' && file.name.endsWith('.html')
          );

          if (!htmlFiles || htmlFiles.length === 0) return null;

          // Apply filter for starred documents if needed
          return htmlFiles
            .filter(file => {
              if (showStarredOnly) {
                const docId = `${courseName}-${folder.name}-${file.name}`;
                return starredDocuments.includes(docId);
              }
              return true;
            })
            .map((file, fileIndex) => (
            <DocumentCard 
              key={`${folder.name}-${file.name}`}
              tabIndex={0}
              aria-label={`${folder.name} - ${file.name.replace('.html', '')}`}
            >
              <StarWrapper>
                <Star 
                  courseId={`${courseName}-${folder.name}-${file.name}`}
                  isStarred={starredDocuments.includes(`${courseName}-${folder.name}-${file.name}`)}
                  onToggle={handleStarToggle}
                />
              </StarWrapper>
              
              <DocumentIconWrapper aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                  <path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z"/>
                </svg>
              </DocumentIconWrapper>
              
              <DocumentContent>
                <DocumentTitle>{folder.name}</DocumentTitle>
                <DocumentSubtitle>{file.name.replace('.html', '')}</DocumentSubtitle>
              </DocumentContent>
              
              <ReadButton 
                onClick={() => navigateToDocument(folder.name, file.name)}
                tabIndex={0}
                aria-label={`Read ${file.name.replace('.html', '')}`}
              >
                <span>Read</span>
                <span className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
                  </svg>
                </span>
              </ReadButton>
            </DocumentCard>
          ));
        })}
      </DocumentGrid>
      
      {courseData.children.every(folder => 
        !folder.children?.some(file => 
          file.type === 'file' && file.name.endsWith('.html')
        )
      ) && (
        <NoResults description="No documents found for this course." />
      )}
    </Container>
  );
};


export default CourseContent;