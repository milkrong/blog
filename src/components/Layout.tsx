import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-gray-800 text-white py-4">
        <div className="container mx-auto">My Blog</div>
      </header>
      <main className="flex-1 container mx-auto p-4">{children}</main>
      <footer className="bg-gray-100 text-center py-4">
        &copy; {new Date().getFullYear()} My Blog
      </footer>
    </div>
  );
}
