// "use client";

// const PER_PAGE = 8;

// export default function TxTablePaginated({ page, onChangePage }: any) {
//   // For now, dummy. Later connect to your TX state or API.
//   const total = 48; 
//   const pages = Math.ceil(total / PER_PAGE);

//   const data = Array.from({ length: PER_PAGE }).map((_, i) => ({
//     id: (page - 1) * PER_PAGE + i + 1,
//     time: "12:0" + i,
//     type: "Issue",
//     txHash: "0x123456",
//     description: "Dummy data",
//   }));

//   return (
//     <div className="glass-card transition-colors p-6">
//       <table className="w-full text-sm text-muted mb-4">
//         <thead>
//           <tr className="border-b border-slate-700/60 text-muted">
//             <th className="py-2 text-left">#</th>
//             <th className="py-2 text-left">Waktu</th>
//             <th className="py-2 text-left">Jenis</th>
//             <th className="py-2 text-left">txHash</th>
//             <th className="py-2 text-left">Info</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((tx) => (
//             <tr key={tx.id} className="border-b border-slate-800">
//               <td className="py-2">{tx.id}</td>
//               <td>{tx.time}</td>
//               <td>{tx.type}</td>
//               <td>{tx.txHash}</td>
//               <td>{tx.description}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Pagination */}
//       <div className="flex justify-between">
//         <button
//           disabled={page <= 1}
//           onClick={() => onChangePage(page - 1)}
//           className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
//         >
//           Prev
//         </button>

//         <span className="text-muted">
//           Page {page} / {pages}
//         </span>

//         <button
//           disabled={page >= pages}
//           onClick={() => onChangePage(page + 1)}
//           className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }
