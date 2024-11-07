import './App.css'
import React, { useEffect, useState, useRef, useCallback, memo } from 'react'
import Post from './components/Post.jsx'
import update from 'immutability-helper'
import { useDrag, useDrop } from 'react-dnd'
import { ItemTypes } from './Constants'

export default function App() {
	const storedList = JSON.parse(localStorage.getItem('list'))
	const [list, setList] = useState(storedList)
	const inputRef = useRef('')
	const [focus, setFocus] = useState(0)

	useEffect(() => {
		localStorage.setItem('list', JSON.stringify(list))
	}, [list])

	useEffect(() => {
		inputRef.current.focus()
	}, [focus])

	function createPost() {
		setFocus(Date.now())
		if (!inputRef.current.value) {
			alert('enter value')
			return
		}
		setList([...list, { id: Date.now(), content: inputRef.current.value }])
		inputRef.current.value = ''
	}

	function deleteAllPosts() {
		setList([])
	}

	const findCard = useCallback(
		id => {
			const card = list.filter(item => item.id === id)[0]
			return {
				card,
				index: list.indexOf(card),
			}
		},
		[list]
	)

	const moveCard = useCallback(
		(id, atIndex) => {
			const { card, index } = findCard(id)
			setList(
				update(list, {
					$splice: [
						[index, 1],
						[atIndex, 0, card],
					],
				})
			)
		},
		[findCard, list, setList]
	)

	const [, drop] = useDrop(() => ({ accept: ItemTypes.POST }))

	return (
		<div className='home'>
			<div className='home_form'>
				<input
					onKeyDown={event => {
						if (event.keyCode === 13) createPost()
					}}
					ref={inputRef}
					placeholder='Type here'
					className='home_form__input'
				></input>
				<button
					onClick={() => createPost()}
					className='home_form__btn home_form__btn-create-post'
				>
					Create post
				</button>
				<button
					className='home_form__btn home_form__btn-delete-all'
					onClick={() => deleteAllPosts()}
				>
					Delete all posts
				</button>
			</div>

			<ul ref={drop} className='list'>
				{list.length ? (
					list.map(post => {
						return (
							<Post
								key={post.di}
								content={post.content}
								id={post.id}
								moveCard={moveCard}
								findCard={findCard}
								list={list}
								setList={setList}
							/>
						)
					})
				) : (
					<h1 className='list_title'>No posts yet. Create new one!</h1>
				)}
			</ul>
		</div>
	)
}
