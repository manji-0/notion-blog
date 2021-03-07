const Table = ({children, id, tableData={}}) => {
  let heads = []
  let headsElement = []
  let rowsElement = []

  Object.keys(tableData).forEach(slug => {
    delete tableData[slug].Slug
  })

  Object.keys(tableData["-1"]).sort().forEach(head => {
    const item = head.split("-")[1]
    heads.push(head)
    headsElement.push(
      <th>{item}</th>
    )
  })

  Object.keys(tableData).forEach(slug => {
    let row = []

    heads.forEach(head => {
      row.push(
        <td>{tableData[slug][head]}</td>
      )
    })

    rowsElement.push(
      <tr key={slug}>
        {row}
      </tr>
    )
  })

  return (
    <table id={id} className="article">
    <tr key={id}>
      {headsElement}
    </tr>
    {rowsElement}
    </table>
    )
}
  
export default Table
