import { Thing, getPropertyAll, removeThing, saveSolidDatasetAt, setStringNoLocale, setThing } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import React, { useState } from "react";
import { useResource } from "../../contexts/resource";
import { useUrl } from "../../contexts/url";
import { useDataset } from "../../hooks/dataset";
import PredicateViewer from "./PredicateViewer";

interface Props {
    thing: Thing
    disableEditing?: boolean
    disableDeleting?: boolean
}

function ThingViewer({ thing, disableEditing, disableDeleting }: Props) {
    const predicates = getPropertyAll(thing).map((predicate, key) => <PredicateViewer key={key} thing={thing} predicate={predicate} />)
    const [editVisible, setEditVisible] = useState(false);
    const toggleEditVisible = () => setEditVisible(!editVisible);
    const dataset = useDataset()
    const { url } = useUrl()
    const { fetchResource } = useResource()

    function deleteThing() {
        if (!url) return
        const confirmed = confirm(`Are you sure you would like to delete the thing: ${thing.url}`)
        if (!confirmed) return

        const removed = removeThing(dataset, thing)
        saveSolidDatasetAt(url, removed, { fetch: fetch }).then(fetchResource).catch(alert)
    }

    function editThing(event: React.FormEvent) {
        event.preventDefault();
        let localThing = thing;
        for (const predicate of Object.keys(thing.predicates)) {
            const predicateValue = (event.target as HTMLFormElement)[`${predicate}_value`].value;
            localThing = setStringNoLocale(localThing, predicate, predicateValue);
        }
        const newDataset = setThing(dataset, localThing)

        if (url) {
            saveSolidDatasetAt(url, newDataset, { fetch: fetch })
                .then(() => {
                    setEditVisible(false);
                })
                .then(fetchResource)
                .catch(alert)
        }
    }

    return (<>
        <details>
            <summary>{thing.url} {!disableEditing && <a href="#" onClick={toggleEditVisible}>edit</a>} {!disableDeleting && <a href="#" onClick={deleteThing}>delete</a>}</summary>
            {predicates}
        </details>
        {editVisible && (
            <div>
                <form onSubmit={editThing}>
                    {React.Children.toArray(Object.keys(thing.predicates).map(predicate => (<>
                        <input type="text" defaultValue={predicate} name={predicate} />
                        <input type="text" defaultValue={thing.predicates[predicate]?.literals?.["http://www.w3.org/2001/XMLSchema#string"] ?? ""} name={`${predicate}_value`} />
                    </>)))}
                    <button type="submit">Save</button>
                </form>
            </div>
        )}
    </>)
}

export default ThingViewer