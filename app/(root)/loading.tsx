// export default function Loading() {
//   return (
//     <div className="loadingContainer">
//       <div className="spinner"></div>
//       <div className="loadingText">Loading...</div>
//     </div>
//   );
// }

export default function Loading() {
  return (
    <div className="loadingContainer">
      <div className="skeletonBox"></div>
      <div className="skeletonBox"></div>
      <div className="skeletonBox"></div>
      <div className="skeletonBox"></div>
    </div>
  );
}
