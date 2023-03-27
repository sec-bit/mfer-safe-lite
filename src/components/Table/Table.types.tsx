export type RecordType = AnyLiteral;

export interface Column {
  name: string;
  label: string;
  render?: (text: string, record: RecordType, index: number) => React.ReactNode;
}

export interface Scroll {
  x?: number | string;
  y?: number | string;
}

export interface IPagination {
  pageSize: number;
  currentPage?: number;
}

export interface ITableProps {
  columns: Array<Column>;
  dataSource: Array<RecordType>;
  className?: string;
  draggable?: boolean;
  tableData?: Array<RecordType>;
  setTable?: AnyFunction;
  scroll?: Scroll;
  pagination?: boolean | IPagination;
}

export interface ITableHeaderProps {
  draggable?: boolean;
  columns: Array<Column>;
}

export type ITableBodyProps = ITableProps;
