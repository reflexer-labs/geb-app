const callAbi = [
    {
        inputs: [
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        name: 'call',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
]

const callBytecode =
    '0x608060405234801561001057600080fd5b506101fa806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80631b8b921d14610030575b600080fd5b6101096004803603604081101561004657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019064010000000081111561008357600080fd5b82018360208201111561009557600080fd5b803590602001918460018302840111640100000000831117156100b757600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050919291929050505061010b565b005b8173ffffffffffffffffffffffffffffffffffffffff16816040518082805190602001908083835b602083106101565780518252602082019150602081019050602083039250610133565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d80600081146101b8576040519150601f19603f3d011682016040523d82523d6000602084013e6101bd565b606091505b505050505056fea2646970667358221220b95878bff8305c017820d4ced645e01ed13abc6caed8696ba47ad0c8475590b964736f6c63430007060033'

export { callAbi, callBytecode }
