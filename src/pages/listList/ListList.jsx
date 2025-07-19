import "./listList.css";
import { DataGrid } from "@material-ui/data-grid";
import { DeleteOutline } from "@material-ui/icons";
import { Link } from "react-router-dom";
import React, { useContext, useEffect } from "react";
import { ListContext } from "../../context/listContext/ListContext";
import { deleteList, getLists } from "../../context/listContext/apiCalls";

export default function ListList() {
  const { lists, dispatch } = useContext(ListContext);

  useEffect(() => {
    getLists(dispatch);
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      try {
        await deleteList(id, dispatch);
      } catch (error) {
        console.error("Error deleting list:", error);
      }
    }
  };

  const columns = [
    { field: "_id", headerName: "ID", width: 220, hide: true },
    {
      field: "title",
      headerName: "Title",
      width: 250,
      renderCell: (params) => (
        <span className="listTitle">
          {params.row.title}
          {params.row.isNetflixOriginal && (
            <span className="netflixOriginalBadge">Netflix</span>
          )}
        </span>
      ),
    },
    {
      field: "genre",
      headerName: "Genre",
      width: 120,
      renderCell: (params) => (
        <span className="genreBadge">{params.row.genre}</span>
      ),
    },
    {
      field: "type",
      headerName: "Type",
      width: 120,
      renderCell: (params) => (
        <span className="typeBadge">{params.row.type}</span>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      width: 180,
      renderCell: (params) => (
        <span className="categoryBadge">{params.row.category}</span>
      ),
    },
    {
      field: "contentCount",
      headerName: "Items",
      width: 80,
      valueGetter: (params) => params.row.content.length,
    },
    {
      field: "action",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => {
        return (
          <div className="actionButtons">
            <Link
              to={{
                pathname: "/list/" + params.row._id,
                state: { list: params.row },
              }}
            >
              <button className="productListEdit">Edit</button>
            </Link>
            <DeleteOutline
              className="productListDelete"
              onClick={() => handleDelete(params.row._id)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="productList">
      <div className="listListHeader">
        <h1 className="listListTitle">Content Lists</h1>
        <Link to="/newList">
          <button className="productAddButton">Create New List</button>
        </Link>
      </div>
      <DataGrid
        rows={lists}
        disableSelectionOnClick
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        getRowId={(r) => r._id}
        autoHeight
        density="comfortable"
      />
    </div>
  );
}
