import React from 'react'
import { Store } from 'lucide-react'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from './button'

const Shop = () => {
    return (
        <Drawer>
            <DrawerTrigger className='bg-white p-4 rounded-lg shadow-lg flex gap-x-4 items-center font-bold'>
                <Store /> SHOP
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>SHOP</DrawerTitle>
                    <DrawerDescription className='h-[50vh]'>Item List:</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                    {/* <Button>Submit</Button> */}
                    <DrawerClose>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default Shop