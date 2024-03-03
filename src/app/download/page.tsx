"use client";
import Image from "next/image";
// import "./page.module.css";
import Downloads from './Downloads';
import Header from '../header';
import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect to '/login' if the user is not signed in
    if (!isSignedIn && router && isLoaded) {
      router.push('/signup');
    }
  }, [isSignedIn, router]);

  // Render the page content only if the user is signed in
  if (!isSignedIn) {
    // Return null, a loading indicator, or any placeholder content
    // to display while the redirect is being processed
    return null;
  }

  return (
    <>
      <Header currentOn={"View Downloads"}/>
      <Downloads />
    </>
  );
}
