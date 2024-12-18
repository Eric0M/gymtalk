"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { programs } from "@/constants";
import { getAuth } from "firebase/auth";
import { initFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { getCheckoutUrl } from "../pricing/singleStripePayment";
import Link from "next/link";

export default async function ProgramOptions() {
  const app = initFirebase();
  const auth = getAuth(app);
  const user = auth.currentUser;
  const router = useRouter();

  // async function handleCheckout(priceID: string) {
  //   const url = await getCheckoutUrl(app, priceID);

  //   if (user) {
  //     window.open(url, "_blank");
  //   } else {
  //     router.push("/login");
  //   }
  // }

  return (
    <section className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Our Programs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-full aspect-[2/2] relative mb-4">
                <Image
                  src={program.image}
                  alt={program.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="rounded-lg object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">
                {program.title}
              </h3>
              <p className="text-center mb-4 text-gray-400">
                {program.description}
              </p>
              <Link href={program.href}>
                <Button
                  variant="secondary"
                  className="w-auto bg-indigo-600 text-white hover:bg-indigo-400 rounded-full"
                >
                  {program.buttonText}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
