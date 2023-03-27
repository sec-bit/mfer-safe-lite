import React, { useMemo, useState } from 'react';
import cls from 'clsx';
import { isObject } from '@/utils/misc';
import Pagination from '../Pagination';
import styles from './table.module.css';
import { ITableProps, IPagination } from './Table.types';
import TableHeader from './TableHeader';
import TableBody from './TableBody';

const Table: React.FC<ITableProps> = ({
  columns,
  dataSource,
  className = '',
  draggable = false,
  tableData,
  setTable,
  scroll = {},
  pagination
}) => {
  const formattedPagination = useMemo(() => {
    if (isObject(pagination)) {
      return pagination as IPagination;
    } else if (pagination) {
      return {
        pageSize: 10,
        currentPage: 1
      };
    } else {
      return null;
    }
  }, [pagination]);

  const [page, setPage] = useState(() => {
    if (formattedPagination?.currentPage) {
      return formattedPagination.currentPage;
    } else {
      return 1;
    }
  });

  const tableStyle = useMemo(
    () => ({
      '--count-column': draggable ? columns.length + 1 : columns.length,
      maxHeight: scroll.y,
      width: scroll.x
    }),
    [columns, draggable, scroll]
  ) as React.CSSProperties;

  const bodyDataSource = useMemo(() => {
    if (formattedPagination?.pageSize) {
      const startIndex = (page - 1) * formattedPagination.pageSize;
      const endIndex = Math.min(
        startIndex + formattedPagination.pageSize,
        dataSource.length
      );
      return dataSource.slice(startIndex, endIndex);
    } else {
      return dataSource;
    }
  }, [formattedPagination, dataSource, page]);

  const total = useMemo(() => {
    if (formattedPagination?.pageSize) {
      return Math.ceil(dataSource.length / formattedPagination.pageSize);
    } else {
      return 0;
    }
  }, [formattedPagination, dataSource]);

  return (
    <div className={styles.wrapper}>
      <table className={cls(styles.table, className)} style={tableStyle}>
        <TableHeader columns={columns} draggable={draggable} />
        <TableBody
          columns={columns}
          dataSource={bodyDataSource}
          draggable={draggable}
          tableData={tableData}
          setTable={setTable}
        />
      </table>
      {formattedPagination && (
        <Pagination
          currentPage={page}
          total={total}
          onChange={setPage}
          className={styles.pagination}
        />
      )}
    </div>
  );
};

export default Table;
