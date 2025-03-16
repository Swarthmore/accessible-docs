import Image from 'next/image';
import Link from 'next/link';

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[93.3vh] py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="p-5 bg-white shadow-lg rounded-lg ">
        <Image
          src="https://www.swarthmore.edu/sites/default/files/styles/standard_page_header/public/assets/images/study-learning-working-living/Logo-learning-working-living_v2.png"
          alt="Swarthmore College"
          width={400}
          height={250}
          className="rounded-t-lg  "
        />
        <div className="text-center p-5">
          <h1 className="text-3xl font-bold mb-2 text-red-600 ">Access Denied!</h1>
          <p className="mb-4">This resource is exclusively available to Swarthmore College affiliates.</p>
          <p>Please log in with your <strong>@swarthmore.edu</strong> email account to access this content.</p>
          <Link legacyBehavior href="/">
            <a className="inline-block mt-4 px-6 py-2 text-sm font-medium leading-6 text-center text-white uppercase transition bg-indigo-600 rounded-full shadow ripple hover:shadow-lg hover:bg-indigo-700 focus:outline-none">
              Go back to Home
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
