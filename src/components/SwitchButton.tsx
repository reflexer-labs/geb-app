import React, { useState } from 'react'
import styled from 'styled-components'

interface Props {
    state?: boolean
    getState: (checked: boolean) => void
}

const SwitchButton = ({ state, getState }: Props) => {
    const [checked, setChecked] = useState(state || false)
    const setTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(e.target.checked)
        getState(e.target.checked)
    }

    return (
        <Label>
            <Input type="checkbox" checked={checked} onChange={setTheme} />
            <Slider className="slider round">
                {checked ? (
                    <State className="on">{'ON'}</State>
                ) : (
                    <State>{'OFF'}</State>
                )}
            </Slider>
        </Label>
    )
}

export default SwitchButton

const Label = styled.label`
    position: relative;
    display: inline-block;
    width: 55px;
    height: 26px;
`

const Input = styled.input`
    opacity: 0;
    width: 0;
    height: 0;
    &:checked + .slider {
        background: ${(props) => props.theme.colors.gradient};
    }
    &:focus + .slider {
        box-shadow: 0 0 1px ${(props) => props.theme.colors.gradient};
    }
    &:checked + .slider:before {
        -webkit-transform: translateX(28px);
        -ms-transform: translateX(28px);
        transform: translateX(28px);
    }
`

const Slider = styled.span`
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${(props) => props.theme.colors.secondary};
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 4px;
    &:before {
        position: absolute;
        content: '';
        height: 19px;
        width: 19px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        -webkit-transition: 0.4s;
        transition: 0.4s;
        border-radius: 4px;
    }
`

const State = styled.span`
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 10px;
    &.on {
        right: 0;
        left: 8px;
        color: ${(props) => props.theme.colors.neutral};
    }
`
