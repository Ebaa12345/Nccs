import React from 'react'
import { motion } from "framer-motion";

const Footer = ({ assets }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className='px-4 pt-10 mt-20 bg-slate-50 dark:bg-gray-900 sm:pt-10 sm:mt-40 sm:px-10 lg:px-24 xl:px-40'
    >
      {/* Footer top */}
      <div className='flex justify-between gap-10 lg:items-center max-lg:flex-col'>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className='space-y-5 text-sm text-gray-700 dark:text-gray-400'
        >
          <p className='max-w-md'>From strategy to execution, we craft digital solutions that move your business forward.</p>
          <ul className='flex gap-8'>
            <li><a className='hover:text-primary' href="#hero">Home</a></li>
            <li><a className='hover:text-primary' href="#services">Services</a></li>
            <li><a className='hover:text-primary' href="#our-work">Our Work</a></li>
            <li><a className='hover:text-primary' href="#contact-us">Contact us</a></li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className='text-gray-600 dark:text-gray-400'
        >
          <h3 className='font-semibold'>Subscribe to our newsletter</h3>
          <p className='mt-2 mb-6 text-sm'>The latest news, articles, and resources, sent to your inbox weekly.</p>
          <div className='flex gap-2 text-sm'>
            <input
              type="email"
              placeholder='Enter your email'
              className='w-full p-3 text-sm bg-transparent border border-gray-300 rounded outline-none dark:text-gray-200 dark:border-gray-500'
            />
            <button className='px-6 text-white rounded bg-primary'>Subscribe</button>
          </div>
        </motion.div>
      </div>

      <hr className='my-6 border-gray-300 dark:border-gray-600' />

      {/* Footer bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true }}
        className='flex flex-wrap justify-center gap-4 pb-6 text-sm text-gray-500 sm:justify-between'
      >
        <p>Copyright 2025 CreatStack - All right Reserved.</p>
        <div className='flex items-center justify-between gap-4'>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            <img src={assets?.facebook_icon} alt="Facebook" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <img src={assets?.twitter_icon} alt="Twitter" />
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
            <img src={assets?.instagram_icon} alt="Instagram" />
          </a>
          <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
            <img src={assets?.linkedin_icon} alt="LinkedIn" />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Footer;