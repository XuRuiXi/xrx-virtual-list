import React from 'react';
import { createRoot } from 'react-dom/client';
import './public.css';
import VirtualList from '@/components/VirtualList/VirtualList';
import PosiVirtualList from '@/components/PosiVirtualList/PosiVirtualList';
import DynamicHeightVirtual from '@/components/DynamicHeightVirtual/DynamicHeightVirtual';
import NormalList from '@/components/NormalList/NormalList';
import styles from './index.less';

const data = Array(100000).fill(1).map((_, idx) => ({ id: idx }));

type itemProps = { item: string };

const App = () => {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        {/* <PosiVirtualList list={data} /> */}
        {/* <VirtualList list={data} /> */}
        {/* <iframe src={`./public/NaturalVirtualList.html?data=${JSON.stringify(data)}`} /> */}
        {/* <NormalList list={data} /> */}
      </div>
      <DynamicHeightVirtual />
    </div>
  );
};

createRoot(document.querySelector('#app')).render(<App />);