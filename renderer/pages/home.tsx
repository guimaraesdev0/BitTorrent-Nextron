import React, { useEffect, useState } from 'react';
import Head from 'next/head';

import styles from '../styles/ProgressBar.module.css';


export default function HomePage() {
  const [magnetlink, setmagnetlink] = useState<string>("");
  const [downloadList, setDownloadList] = useState<Array<any>>([]);

  useEffect(() => {
    window.ipc.on('downloadList', (newDownloadList: Array<any>) => {
      setDownloadList(newDownloadList);
    });

    const updateListInterval = setInterval(() => {
      window.ipc.send('updateList', '');
    }, 100);

    return () => clearInterval(updateListInterval);
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>QBitClient</title>
      </Head>
      <div>

        <div className="text-5xl font-extrabold p-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-sky-500">
            QbitClient
          </span>
        </div>


        <form>
          <div className="p-5">
            <div>
              <input type="text" id="magnetlink" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="MagnetLink" onChange={(e) => setmagnetlink(e.target.value)} required/>
              <button onClick={() => { window.ipc.send('starttorrent', magnetlink) }} className='mt-3 font-medium bg-teal-500 text-white w-32 h-9 rounded-md '>Start Download</button>
              <button onClick={() => { window.ipc.send('DeleteHistory', null) }} className='ml-3 mt-3 font-medium bg-red-500 text-white w-32 h-9 rounded-md'>Delete History</button>
              <button onClick={() => { window.ipc.send('DeleteHistory', null) }} className='ml-3 mt-3 font-medium bg-indigo-500 text-white w-32 h-9 rounded-md'>Configure Proxy</button>

            </div>

        </div>
        </form>


        <div className="text-2xl font-extrabold p-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-sky-500">
            
          </span>
        </div>
        {downloadList.map((download, index) => (
          <div key={index} className=' bg-slate-900'>
            <p className='text-xl pt-2 pl-5 text-white'>{download.title} <span className="bg-indigo-100 text-indigo-800 text-xs font-medium  me-2 px-2.5 py-0.5 rounded dark:bg-sky-900 dark:text-indigo-300">Peers: {download.peers}</span></p>
            <p className='pl-5 text-xl text-white'>Progress: <span className="bg-indigo-100 text-indigo-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-indigo-300">{download.progress}%</span></p> 
            <p className='pl-5 text-xl text-white'>DownloadSpeed: <span className="bg-indigo-100 text-indigo-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-indigo-300">{download.downloadSpeed}MB/s</span></p>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}
