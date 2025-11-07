import React from 'react'
import { Input } from "@/components/ui/input"

const SearchBar = () => {
  return (
    <div>
        <Input type="text" placeholder="Search Bookmark" className='sm:w-96 w-52' />
    </div>
  )
}

export default SearchBar