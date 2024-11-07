import React, { useState, useRef, useEffect, memo } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { ItemTypes } from '../Constants'

export default function Post({
	content,
	list,
	setList,
	id,
	moveCard,
	findCard,
}) {
	const [isEditing, setIsEditing] = useState(false)
	const contentRef = useRef(null)

	const originalIndex = findCard(id).index

	const [{ isDragging }, drag] = useDrag(
		() => ({
			type: ItemTypes.POST,
			item: { id, originalIndex },
			collect: monitor => ({
				isDragging: monitor.isDragging(),
			}),
			end: (item, monitor) => {
				const { id: droppedId, originalIndex } = item
				const didDrop = monitor.didDrop()
				if (!didDrop) {
					moveCard(droppedId, originalIndex)
				}
			},
		}),
		[id, originalIndex, moveCard]
	)

	const [, drop] = useDrop(
		() => ({
			accept: ItemTypes.POST,
			hover({ id: draggedId }) {
				if (draggedId !== id) {
					const { index: overIndex } = findCard(id)
					moveCard(draggedId, overIndex)
				}
			},
		}),

		[findCard, moveCard]
	)
	const opacity = isDragging ? 0.2 : 1

	useEffect(() => {
		cancel()
	}, [isDragging])

	function deletePost() {
		setList(
			list.filter(item => {
				return item.id !== id
			})
		)
	}

	function editPost() {
		setIsEditing(true)
		contentRef.current.readOnly = false
		contentRef.current.focus()
	}

	function confirm() {
		setList(
			list.map(item =>
				item.id === id
					? { id: item.id, content: contentRef.current.value }
					: item
			)
		)
		setIsEditing(false)
		contentRef.current.readOnly = true
	}

	function cancel() {
		contentRef.current.value = content
		contentRef.current.readOnly = true
		setIsEditing(false)
	}

	return (
		<li
			style={{ opacity }}
			ref={node => drag(drop(node))}
			key={id}
			className='list_item'
		>
			<input
				onKeyDown={event => {
					if (event.keyCode === 13) confirm()
				}}
				ref={contentRef}
				readOnly
				defaultValue={content}
				className='list_item__content'
			></input>
			{isEditing ? (
				<>
					<button
						onClick={() => confirm()}
						className='list_item__btn list_item__btn-orange'
					>
						confirm
					</button>
					<button
						onClick={() => cancel()}
						className='list_item__btn list_item__btn-red'
					>
						cancel
					</button>
				</>
			) : (
				<>
					<button
						onClick={() => editPost()}
						className='list_item__btn list_item__btn-orange'
					>
						edit
					</button>
					<button
						onClick={() => deletePost()}
						className='list_item__btn list_item__btn-red'
					>
						delete
					</button>
				</>
			)}
		</li>
	)
}
