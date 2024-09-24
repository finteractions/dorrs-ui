import { Table } from "@tanstack/table-core";
import { useEffect, useState } from "react";

type PaginationProps = {
    table: Table<any>;
    pageLength?: number;

};
const portalPageLength = Number(process.env.PORTAL_PAGE_LENGTH)

const Pagination = ({ table, pageLength }: PaginationProps) => {
    const [pageSize, setPageSize] = useState(portalPageLength || 10);

    const pageCount = table.getPageCount();

    const pageIndex = table.getState().pagination.pageIndex;
    let pageItems = [];

    const start = pageIndex < 3 ? 0 : pageIndex - 2;
    const end = start + 2 >= pageCount ? pageCount - 1 : start + 2;

    if (start > 0) {
        pageItems.push(0);
        if (start > 1) {
            pageItems.push(null); // Добавляем первое троеточие
        }
    }

    for (let i = start; i <= end; i++) {
        pageItems.push(i);
    }

    if (end < pageCount - 1) {
        if (end < pageCount - 2) {
            pageItems.push(null); // Добавляем второе троеточие
    }
        pageItems.push(pageCount - 1);
    }

    useEffect(() => {
        table.setPageSize(pageSize);
    }, [pageSize, table]);

    if (pageCount <= 1) {
        return null;
    }

    return (
        <div className="pagination">
            <button
                className="pagination__arrow icon-chevron-left cursor-pointer"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            ></button>

            <span>
                  {pageItems.map((item, index) => {
                      if (item === null) {
                          return (
                              <a
                                  key={index}
                                  href=""
                                  className="pagination__item"
                                  onClick={(e) => {
                                      e.preventDefault();
                                  }}
                              >
                                  ...
                              </a>
                          );
                      } else {
                          return (
                              <a
                                  key={index}
                                  href=""
                                  className={`pagination__item ${
                                      item === pageIndex ? "active" : ""
                                  }`}
                                  onClick={(e) => {
                                      e.preventDefault();
                                      table.setPageIndex(item);
                                  }}
                              >
                                  {item + 1}
                              </a>
                          );
                      }
                  })}
            </span>


            <button
                className="pagination__arrow icon-chevron-right cursor-pointer"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            ></button>
        </div>
    );
};

export default Pagination;
