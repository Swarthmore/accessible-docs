import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CourseContent from '~/components/CourseContent';
import { Box, Typography, CircularProgress } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ScrollToTopButton from '~/components/ScrollToTopButton';
import { useSession } from 'next-auth/react';

const CoursePage = ({ data }) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { course } = router.query;
    if (status === "unauthenticated") {
      router.push("/");
    }
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (data && course) {
      // Find the course in the data array
      const foundCourse = data.find(item => item.name === course);
      
      if (foundCourse) {
        setCourseData(foundCourse);
        setError(null);
      } else {
        setError('Course not found');
      }
      setLoading(false);
    }
  }, [data, course]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
        p={3}
      >
        <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Typography>
          The requested course could not be found. Please check the URL and try again.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <CourseContent courseData={courseData} courseName={course as string} />
      <ScrollToTopButton />
    </Box>
  );
};

export default CoursePage;