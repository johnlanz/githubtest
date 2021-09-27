import { useState, useEffect } from 'react'
import { Octokit } from "@octokit/core"
import ReactPaginate from 'react-paginate'
import { animateScroll as scroll, Element, scroller } from 'react-scroll'

export default function Home() {
  const [repositories, setRepositories] = useState([])
  const [contributors, setContributors] = useState(null)
  const [totalResults, setTotalResults] = useState(null)
  const [pages, setPages] = useState(null)
  const octokit = new Octokit({ auth: `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` });
  let currentPage = 1
  let itemsPerPage = 30
  let searchItem = ""
  async function fetchContributors(owner, repo) {
    const response = await octokit.request('GET /repos/{owner}/{repo}/contributors', {
      owner: owner,
      repo: repo
    })
    setContributors(response.data)
    console.log(response)
  }
  async function fetchRepo() {
    if (!searchItem) return null
    const search = await octokit.request('GET /search/repositories', {
      q: searchItem,
      page: currentPage
    })
    if (search.status == 200) {
      setTotalResults(search.data.total_count)
      setPages(Math.floor(search.data.total_count / itemsPerPage))
      setRepositories(search.data.items)
    }
    return search
  }
  const searchRepo = async event => {
    event.preventDefault()
    searchItem = event.target.name.value
    const search = await fetchRepo()
    console.log(search)
  }
  const handlePageClick = (event) => {
    scroller.scrollTo('scrollToSearch', {
      duration: 500,
      delay: 0,
      smooth: true,
      offset: 0, // Scrolls to element + 50 pixels down the page
    })
    currentPage = event.selected + 1;
    console.log(currentPage)
    fetchRepo()
  }

  const contributorClick = params => (event) => {
    scroller.scrollTo('scrollToContributor', {
      duration: 500,
      delay: 0,
      smooth: true,
      offset: 0, // Scrolls to element + 50 pixels down the page
    })
    console.log(params)
    fetchContributors(params.owner.login, params.name)
  }

  return (
    <>
    <div className="container">
      <h1>Search Github</h1>
      <form onSubmit={searchRepo}>
        <input id="name" className="form-control" type="text" autoComplete="name" required />
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>

      <Element name="scrollToContributor"></Element>
      {contributors &&
        <div id="contributors">
          <hr />
          <p>Contributors</p>
          <div className="row row-cols-1 row-cols-md-4 g-4">
            {contributors.map((contributor, i) => {
              return <div key={contributor.login} className="col">
                  <div className="card">
                    <img src={contributor.avatar_url} className="card-img-top" alt="avatar" />
                    <div className="card-body">
                      <h5 className="card-title">{contributor.login}</h5>
                      <p className="card-text">{contributor.html_url}</p>
                    </div>
                  </div>
              </div>
            })}
          </div>
        </div>
      }
      <hr />
      
      <Element name="scrollToSearch"></Element>
      {totalResults && <div id="results">
        <p>Showing {totalResults} available repository results</p>
        <hr />
        {repositories.map((repo, i) => {
          return <div key={i}>
            <a href={repo.url} target="_blank" rel="noreferrer">{repo.full_name}</a>
            <p>{repo.description}</p>
            <button className="btn btn-secondary" onClick={contributorClick(repo)}>Contributors</button>
            <hr />
          </div>
        })}
        <nav aria-label="Page navigation">
            <ReactPaginate
              previousLabel={'prev'}
              previousClassName={'page-item'}
              previousLinkClassName={'page-link'}
              nextLabel={'next'}
              nextClassName={'page-item'}
              nextLinkClassName={'page-link'}
              pageCount={pages}
              onPageChange={handlePageClick}
              containerClassName={'pagination'}
              activeClassName={'active'}
              pageClassName={'page-item'}
              pageLinkClassName={'page-link'}
            />
        </nav>
      </div>
      }
      
    </div>
    </>
  )
}
