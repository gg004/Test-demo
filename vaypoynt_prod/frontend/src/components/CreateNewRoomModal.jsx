import React from "react";
import MkdSDK from "../utils/MkdSDK";

const CreateNewRoomModal = ({ createNewRoom, setCreateRoom }) => {
    const [otherUsers, setOtherUsers] = React.useState()
    const [unfilteredUsers, setUnfilteredUsers] = React.useState()
    const [search, setSearch] = React.useState("")

    let sdk = new MkdSDK();
    const getAllUsers = async () => {
        try {
            let users = await sdk.getAllUsers()
            if (!users.error) {
                setOtherUsers(users?.list)
                setUnfilteredUsers(users?.list)
            }
        } catch (err) {
            console.log('Error', err)
        }
    }

    const filterList = (value) => {
        setSearch(value)
        if (value.length > 0) {
            setOtherUsers([...unfilteredUsers].filter((user) => user.first_name.includes(value) || user.last_name.includes(value)))
        } else {
            setOtherUsers(unfilteredUsers)
        }
    }

    React.useEffect(() => {
        (async function () {
            await getAllUsers();
        })();
    }, [])


    return (
        <>
            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div
                    className="fixed inset-0 w-full h-full bg-black opacity-40"
                    onClick={() => setCreateRoom(false)}
                ></div>
                <div className="flex items-center min-h-screen px-4 py-8">
                    <div className="relative w-full max-w-lg p-4 mx-auto bg-white rounded-md shadow-lg">
                        <div className="mt-3 sm:flex">
                            <div className="mt-2 text-center sm:ml-4 sm:text-left w-full px-2">
                                <input
                                    type="text"
                                    className="outline-none py-2 block w-full bg-transparent border-b-2 border-gray-200"
                                    placeholder="Search"
                                    value={search}
                                    onChange={(e) => filterList(e.target.value)}
                                />
                                <ul className="mt-4 w-full text-sm font-medium text-gray-900 h-[50vh] overflow-y-scroll scrollbar-hide">
                                    {otherUsers && otherUsers.map((user) =>
                                        <li key={user.id} onClick={() => createNewRoom(user)} className="py-2 px-4 w-full bg-white hover:bg-gray-200 ">{user.first_name} {user.last_name}</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CreateNewRoomModal