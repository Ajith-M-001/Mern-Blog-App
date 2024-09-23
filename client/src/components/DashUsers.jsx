import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Modal, Table } from "flowbite-react";
import { MdDelete } from "react-icons/md";
import { GrClose } from "react-icons/gr";
import { FcCheckmark } from "react-icons/fc";

const DashComments = () => {
  const { CurrentUser } = useSelector((state) => state.user);
  const [comments, setComments] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch("/api/v1/comment/getAllComments"); // Adjusted the endpoint if necessary
        const data = await res.json();
        console.log(data.comments);
        setComments(data.comments);
        if (data.comments.length <= 10) {
          setShowMore(false);
        }
      } catch (error) {
        console.log("Error:", error);
      }
    };

    // Fetch comments only if CurrentUser exists and is an admin
    if (CurrentUser?.isAdmin) {
      fetchComments();
    }
  }, [CurrentUser]);

  const handleShowMore = async () => {
    const startIndex = comments.length;
    try {
      const res = await fetch(
        `/api/v1/comment/getMoreComments?startIndex=${startIndex}`
      );
      const data = await res.json();
      if (res.ok) {
        setComments((prevComments) => [...prevComments, ...data.comments]);
        if (data.comments.length <= 10) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handleCommentDelete = async () => {
    setShowModal(false);
    try {
      const res = await fetch(
        `/api/v1/comment/delete/${commentIdToDelete}/${CurrentUser._id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (res.ok) {
        console.log(data.message);
        setComments((prevComments) =>
          prevComments.filter((comment) => comment._id !== commentIdToDelete)
        );
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {CurrentUser?.isAdmin && comments.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date Created</Table.HeadCell>
              <Table.HeadCell>Comment Content</Table.HeadCell>
              <Table.HeadCell>No of Likes</Table.HeadCell>
              <Table.HeadCell>Post ID</Table.HeadCell>
              <Table.HeadCell>User ID</Table.HeadCell>
              <Table.HeadCell>Admin</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {comments.map((comment) => (
                <Table.Row key={comment._id}>
                  <Table.Cell>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>{comment.content}</Table.Cell>
                  <Table.Cell>{comment.numberOfLikes}</Table.Cell>
                  <Table.Cell>{comment.postId}</Table.Cell>
                  <Table.Cell>{comment.userId}</Table.Cell>
                  <Table.Cell>
                    {CurrentUser.isAdmin ? (
                      <FcCheckmark className="text-green-500 text-3xl" />
                    ) : (
                      <GrClose className="text-red-500 text-3xl" />
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowModal(true);
                        setCommentIdToDelete(comment._id);
                      }}
                      className="text-red-500 font-medium hover:underline cursor-pointer"
                    >
                      Delete
                    </span>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          {showMore && (
            <button
              onClick={handleShowMore}
              className="w-full text-teal-500 self-center mt-2"
            >
              Show More
            </button>
          )}
        </>
      ) : (
        <p>No comments yet</p>
      )}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <MdDelete className="h-14 w-14 text-gray-400 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500">
              Are you sure you want to delete this comment?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleCommentDelete}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashComments;
