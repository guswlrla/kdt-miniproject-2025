'use client';

import Link from "next/link";

export default function Header() {

    {/* <header className="fixed top-0 z-50 h-14 w-full bg-white xl:ml-55 md:ml-15 border-b border-gray-200">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-start p-2 font-medium">
                  <span>🚑 병원 정보 서비스</span>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center ms-3">
                    <div>
                      <button type="button" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false" data-dropdown-toggle="dropdown-user">
                        <span className="sr-only">Open user menu</span>
                        <img className="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="user photo" />
                      </button>
                    </div>
                    <div className="z-50 hidden bg-neutral-primary-medium border border-default-medium rounded-base shadow-lg w-44" id="dropdown-user">
                      <div className="px-4 py-3 border-b border-default-medium" role="none">
                        <p className="text-sm font-medium text-heading" role="none">
                          Neil Sims
                        </p>
                        <p className="text-sm text-body truncate" role="none">
                          neil.sims@flowbite.com
                        </p>
                      </div>
                      <ul className="p-2 text-sm text-body font-medium" role="none">
                        <li>
                          <a href="#" claWssName="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded" role="menuitem">Dashboard</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header> */}
  return (
    <header className='fixed top-0 left-0 z-50 h-14 w-full bg-white border-b border-gray-200'>
      <div className="h-14 ml-3 p-1">
        <Link href='./medicalInfo' >
          <img src='../headerIcon.png' className="h-full" />
        </Link>
      </div>
    </header>
  );
}