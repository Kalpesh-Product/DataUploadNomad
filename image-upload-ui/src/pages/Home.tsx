import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main>
      <h1 className="text-4xl font-bold text-center">
        Welcome to the app that makes your life a little easier
      </h1>
      <Link
        to="/bulk-insert-images"
        className="block mt-4 text-center text-blue-500 hover:underline">
        bulk upload images
      </Link>
      <Link
        to="/upload-single-image"
        className="block mt-4 text-center text-blue-500 hover:underline">
        upload company logo and single image
      </Link>
      <Link
        to="/bulk-insert-companies"
        className="block mt-4 text-center text-blue-500 hover:underline">
        upload companies
      </Link>
    </main>
  );
}
