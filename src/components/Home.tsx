import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import NoResults from './NoResults';

type CourseItem = {
  name: string;
  type?: 'coursefolder';
  children?: CourseItem[];
};

interface HomeProps {
    data: CourseItem[];
    setSelectedKey: (key: string) => void;
  }

const Home: React.FC<HomeProps> = ({ data, setSelectedKey }) => {
const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setSelectedKey(entry.target.getAttribute("data-index") || '');
          }
        });
      },
      { rootMargin: '0px', threshold: 0.1 }
    );
  
    sectionRefs.current.forEach((section, index) => {
      if (section) {
        observer.observe(section);
      }
    });
  
    return () => {
      sectionRefs.current.forEach(section => {
        if (section) observer.unobserve(section);
      });
    };
  }, [data, setSelectedKey]);
  


  return (
    <div className="p-5 dark:bg-black">
      {data.length !== 0 && (
        <h1 className="text-center text-2xl font-bold mb-10 dark:text-white">Welcome to the <strong>Accessible Docs</strong></h1>
      )}
  
      {data.length !== 0 && (
        <p className="text-center mb-10 dark:text-gray-200">Explore accessible course documents and enhance your learning experience.</p>
      )}
  
      {data.length === 0 ? (
        <div className="flex justify-center items-center h-[calc(100vh-163px)]">
          <NoResults description="No search results found" />
        </div>
      ) : (
        data.map((course, index) => (
          <div ref={el => sectionRefs.current[index] = el} data-index={(index + 1).toString()} key={index} tabIndex={0} aria-label={`${course.name} course-folder`} className="mt-12 mb-5 p-5 bg-white dark:bg-slate-800 border border-gray-500 dark:border-gray-600 shadow-xl rounded-lg dark:text-gray-100" id={course.name}>
            <h2 className="bg-orange-200 dark:bg-orange-700  dark:text-white text-center text-lg font-semibold py-3">{course.name}</h2>
  
            {course.children?.map((item, subIndex) => (
              <div key={subIndex} className="ml-5 my-5">
                {item.type === 'coursefolder' ? (
                  <div className="my-5">
                    <h3 id={item.name} className="font-medium">{item.name}</h3>
  
                    {item.children?.map((file, fileIndex) => (
                      file.name.endsWith('.html') && (
                        <Link style={{
                          
                        }} href={`/${course.name}/${item.name}/${file.name}`} key={fileIndex} legacyBehavior>
                          <a id={`${course.name}/${item.name}/${file.name}`} className="block ml-5 mt-2 text-blue-800 dark:text-[#22d3ee] hover:text-blue-600 dark:hover:text-blue-300 hover:underline">{file.name}</a>
                        </Link>
                      )
                    ))}
                  </div>
                ) : (
                  <Link href={`/${course.name}/${item.name}`} legacyBehavior>
                    <a className="block ml-5 mt-2 text-blue-800 dark:text-[#22d3ee]
                  dark:hover:text-blue-300 hover:text-blue-600  hover:underline">{item.name}</a>
                  </Link>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
  
              }

export default Home;

