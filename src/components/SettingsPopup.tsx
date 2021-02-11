import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import SettingsIcon from './Icons/SettingsIcon'
import SettingsContent from './SettingsContent'

const SettingsPopup = () => {
    const wrapperRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)

    const handleClickOutside = (e: any) => {
        const wrapper: any = wrapperRef.current
        if (!wrapper.contains(e.target)) {
            setTimeout(() => {
                setIsOpen(false)
            }, 10)
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    })

    return (
        <>
            <InnerContent ref={wrapperRef}>
                <SettingsButton onClick={() => setIsOpen(!isOpen)}>
                    <SettingsIcon />
                </SettingsButton>
                {isOpen ? (
                    <>
                        <CaretImg src={require('../assets/caret-up.svg')} />
                        <Menu>
                            <SettingsContent />
                        </Menu>
                    </>
                ) : null}
            </InnerContent>
        </>
    )
}

export default SettingsPopup

const InnerContent = styled.div`
    position: relative;
    z-index: 99;
`

const Menu = styled.div`
    background: ${(props) => props.theme.colors.background};
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    padding: 20px;
    position: absolute;
    top: 65px;
    right: 0;
    width: 300px;
`

const CaretImg = styled.img`
    position: absolute;
    top: 57px;
    right: 5px;
    z-index: 1;
`

const SettingsButton = styled.button`
    background: ${(props) => props.theme.colors.border};
    box-shadow: none;
    outline: none;
    cursor: pointer;
    border: 0;
    color: ${(props) => props.theme.colors.secondary};
    padding: 9px 10px;
    margin: 0;
    line-height: normal;
    border-radius: ${(props) => props.theme.global.borderRadius};
    transition: all 0.3s ease;
    position: relative;
    svg {
        width: 20px;
        height: 20px;
        display: block;
        color: ${(props) => props.theme.colors.secondary};
    }

    &:hover {
        background: ${(props) => props.theme.colors.secondary};
        svg {
            color: ${(props) => props.theme.colors.border};
        }
    }
`
