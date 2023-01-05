import React from 'react';
import { createRoot } from 'react-dom/client';
import './public.css';
import VirtualList from '@/components/VirtualList/VirtualList';
import PosiVirtualList from '@/components/VirtualList/PosiVirtualList';
import styles from './index.less';
const data = Array(100).fill(1).map((_, idx) => ({ id: idx }));

const App = () => {
  return (
    <div className={styles.root}>
      {/* <PosiVirtualList list={data} /> */}
      <VirtualList list={data} />
      {/* <iframe src={`./public/NaturalVirtualList.html?data=${JSON.stringify(data)}`} /> */}
    </div>
  );
};

createRoot(document.querySelector('#app')).render(<App />);