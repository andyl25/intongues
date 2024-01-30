import Image from "next/image";
import styles from "../page.module.css";
import Upload from '../upload';
import { UserButton } from "@clerk/nextjs";
import { SignUp } from "@clerk/nextjs";
import './signin.module.css'

export default function Home() {
  return(
    <body>
          <div className="flex min-h-screen items-center justify-center">
            <div className="signin-container">
                <SignUp signInUrl="/signin"/>
            </div>
          </div>
    </body>

  );
}
